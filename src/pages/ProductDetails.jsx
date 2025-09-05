import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  Rating,
  Stack,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { fetchProduct, fetchReviews } from "../api/ApiService.jsx";
import { useCart } from "../global_component/CartContext";
import { useAuth } from "../global_component/AuthContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct(id).then((data) => setProduct(data));
    fetchReviews(id).then((data) => setReviews(data));
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1); // adding one quantity
    } catch (e) {
      console.error("Error adding to cart:", e);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      const redirectTarget = encodeURIComponent("/checkout");
      navigate(`/login?redirect=${redirectTarget}`, { state: { from: location } });
      return;
    }
    await handleAddToCart();
    navigate("/checkout");
  };

  return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {product.name}
        </Typography>
        <Grid container spacing={2}>
          {/* Image Gallery */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              {product.images.map((img, index) => (
                  <Grid item xs={6} key={index}>
                    <Card>
                      <CardMedia
                          component="img"
                          image={img}
                          alt={`Product image ${index}`}
                          sx={{ height: 200, objectFit: "cover" }}
                      />
                    </Card>
                  </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            <Typography variant="subtitle1">Category: {product.category}</Typography>
            <Typography variant="h6">Price: ₹{product.price}</Typography>

            {/* Add to Cart + Buy Now buttons */}
            <Stack spacing={1.5} sx={{ mt: 2, maxWidth: 250 }}>
              <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                  variant="contained"
                  color="warning"
                  startIcon={<FlashOnIcon />}
                  onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Reviews */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Customer Reviews
          </Typography>
          {reviews.length === 0 ? (
              <Typography>No reviews yet.</Typography>
          ) : (
              reviews.map((review, index) => (
                  <Card key={index} sx={{ mt: 2, p: 2 }}>
                    <Typography>
                      <strong>{review.user}</strong>
                    </Typography>
                    <Rating value={review.rating} readOnly />
                    <Typography>{review.comment}</Typography>
                  </Card>
              ))
          )}
        </Box>
      </Box>
  );
}

export default ProductDetails;
