import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    MenuItem,
    Alert,
    Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { addProduct } from '../../api/ApiService'; // Import from your updated Service
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Books", "Toys"];

function AddProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            // 1. Prepare data for Backend
            // backend expects 'images' as a List<String>, but form has single 'imageUrl'
            const payload = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                price: parseFloat(formData.price),
                images: [formData.imageUrl] // Wrap single URL in an array
            };

            // 2. Call the API
            await addProduct(payload);

            setSuccess(true);

            // Optional: Reset form or redirect
            setTimeout(() => navigate('/'), 2000);

        } catch (err) {
            console.error(err);
            setError("Failed to add product. Ensure you are an Admin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 800 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Admin Dashboard: Add Product
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>Product added successfully!</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>

                        {/* Product Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Product Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        {/* Category Select */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                {CATEGORIES.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Price */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Price (₹)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                inputProps={{ min: "0", step: "0.01" }}
                            />
                        </Grid>

                        {/* Image URL */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Image URL"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                helperText="e.g., http://localhost:8080/images/prod1.jpg"
                                required
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<CloudUploadIcon />}
                                    disabled={loading}
                                >
                                    {loading ? "Publishing..." : "Publish Product"}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

export default AddProduct;