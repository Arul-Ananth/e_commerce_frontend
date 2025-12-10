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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete Icon

import { fetchProduct, fetchReviews, deleteProduct } from "../api/ApiService.jsx"; // Import deleteProduct
import { useCart } from "../global_component/CartContext";
import { useAuth } from "../global_component/AuthContext";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);

    // Auth & Cart
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth(); // Destructure 'user' to check roles

    // Check if Admin
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    // Delete Modal State
    const [openDelete, setOpenDelete] = useState(false);

    useEffect(() => {
        fetchProduct(id).then((data) => setProduct(data));
        fetchReviews(id).then((data) => setReviews(data));
    }, [id]);

    if (!product) return <p>Loading product...</p>;

    const handleAddToCart = async () => {
        try {
            await addToCart(product, 1);
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

    // --- Delete Logic ---
    const handleDeleteClick = () => {
        setOpenDelete(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteProduct(id);
            setOpenDelete(false);
            // Redirect to home after deletion
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Failed to delete product", err);
            alert("Failed to delete product. It might be in a user's cart.");
        }
    };

    const handleCancelDelete = () => {
        setOpenDelete(false);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                {product.name}
            </Typography>

            <Grid container spacing={2}>
                {/* Left: Images */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Grid container spacing={1}>
                        {product.images && product.images.map((img, index) => (
                            <Grid size={{ xs: 6 }} key={index}>
                                <Card sx={{ height: '100%' }}>
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

                {/* Right: Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body1" paragraph>
                        {product.description}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Category: {product.category}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
                        Price: ₹{product.price}
                    </Typography>

                    <Stack spacing={2} sx={{ mt: 2, maxWidth: 400 }}>
                        {/* User Buttons */}
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddShoppingCartIcon />}
                                onClick={handleAddToCart}
                                sx={{ flexGrow: 1 }}
                            >
                                Add to Cart
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<FlashOnIcon />}
                                onClick={handleBuyNow}
                                sx={{ flexGrow: 1 }}
                            >
                                Buy Now
                            </Button>
                        </Stack>

                        {/* Admin Only Delete Button */}
                        {isAdmin && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteClick}
                                sx={{ mt: 2 }}
                            >
                                Delete Product (Admin)
                            </Button>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {/* Reviews Section */}
            <Box sx={{ mt: 5 }}>
                <Typography variant="h5" gutterBottom>
                    Customer Reviews
                </Typography>
                {reviews.length === 0 ? (
                    <Typography color="text.secondary">No reviews yet.</Typography>
                ) : (
                    reviews.map((review, index) => (
                        <Card key={index} sx={{ mt: 2, p: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {review.user}
                                </Typography>
                                <Rating value={review.rating} readOnly size="small" />
                            </Stack>
                            <Typography variant="body2">{review.comment}</Typography>
                        </Card>
                    ))
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDelete}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete this product?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to permanently delete <strong>{product.name}</strong>?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProductDetails;