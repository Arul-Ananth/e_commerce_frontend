import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllUsers, deleteUser, flagUser, unflagUser } from '../../api/ApiService';
import { useAuth } from '../../global_component/AuthContext';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const { user: currentUser } = useAuth();

    const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');
    const isManager = currentUser?.roles?.includes('ROLE_MANAGER');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to load users", err);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure? This deletes the user permanently.")) return;
        await deleteUser(id);
        loadUsers();
    };

    const handleFlag = async (id) => {
        await flagUser(id);
        loadUsers();
    };

    const handleUnflag = async (id) => {
        await unflagUser(id);
        loadUsers();
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>User Management</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Roles</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id} sx={{ backgroundColor: u.flagged ? '#fff4f4' : 'inherit' }}>
                                <TableCell>{u.id}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.realUsername || u.username}</TableCell>
                                <TableCell>
                                    {u.flagged ? (
                                        <Chip icon={<FlagIcon />} label="Flagged" color="error" size="small" />
                                    ) : (
                                        <Chip label="Active" color="success" size="small" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {u.roles && u.roles.map(r => r.name).join(", ")}
                                </TableCell>
                                <TableCell>
                                    {/* Manager Action: Flag */}
                                    {isManager && !u.flagged && (
                                        <Button
                                            size="small"
                                            color="warning"
                                            startIcon={<FlagIcon />}
                                            onClick={() => handleFlag(u.id)}
                                        >
                                            Flag
                                        </Button>
                                    )}

                                    {/* Admin Actions: Delete & Unflag */}
                                    {isAdmin && (
                                        <>
                                            {u.flagged && (
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleUnflag(u.id)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Review OK
                                                </Button>
                                            )}
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}