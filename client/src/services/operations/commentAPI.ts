import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { commentEndpoints } from "../api";
import { createAsyncThunk } from "@reduxjs/toolkit";

const {
    CREATE_COMMENT,
    UPDATE_COMMENT,
    DELETE_COMMENT,
    GET_COMMENTS_BY_POST,
    VOTE_COMMENT,
} = commentEndpoints;

// Create a new comment
export const createComment = createAsyncThunk(
    'comments/create',
    async (commentData: {
        postId: string;
        content: string;
        parentComment?: string;
        isAnonymous?: boolean;
    }, { getState }) => {
        const toastId = toast.loading("Creating comment...");
        try {
            const state = getState() as any;
            const { token } = state.auth;
            
            const response = await apiConnector(
                "POST",
                CREATE_COMMENT,
                commentData,
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Comment created successfully");
            return response.data.comment;
        } catch (error: any) {
            console.log("CREATE COMMENT API ERROR............", error);
            toast.error(error.response?.data?.message || "Could not create comment");
            throw error;
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// Get comments for a post
export const getPostComments = createAsyncThunk(
    'comments/getByPost',
    async ({ postId, page = 1, limit = 10 }: { postId: string; page?: number; limit?: number }, { getState }) => {
        try {
            const state = getState() as any;
            const { token } = state.auth;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await apiConnector(
                "GET",
                `${GET_COMMENTS_BY_POST(postId)}?page=${page}&limit=${limit}`,
                null,
                headers
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            return {
                comments: response.data.comments,
                pagination: response.data.pagination,
            };
        } catch (error: any) {
            console.log("GET POST COMMENTS API ERROR............", error);
            toast.error(error.response?.data?.message || "Could not fetch comments");
            throw error;
        }
    }
);

// Update a comment
export const updateComment = createAsyncThunk(
    'comments/update',
    async ({ commentId, updateData }: { commentId: string; updateData: {
        content?: string;
        isAnonymous?: boolean;
    }}, { getState }) => {
        const toastId = toast.loading("Updating comment...");
        try {
            const state = getState() as any;
            const { token } = state.auth;
            
            const response = await apiConnector(
                "PUT",
                UPDATE_COMMENT(commentId),
                updateData,
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Comment updated successfully");
            return response.data.comment;
        } catch (error: any) {
            console.log("UPDATE COMMENT API ERROR............", error);
            toast.error(error.response?.data?.message || "Could not update comment");
            throw error;
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// Delete a comment
export const deleteComment = createAsyncThunk(
    'comments/delete',
    async (commentId: string, { getState }) => {
        const toastId = toast.loading("Deleting comment...");
        try {
            const state = getState() as any;
            const { token } = state.auth;
            
            const response = await apiConnector(
                "DELETE",
                DELETE_COMMENT(commentId),
                null,
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Comment deleted successfully");
            return commentId;
        } catch (error: any) {
            console.log("DELETE COMMENT API ERROR............", error);
            toast.error(error.response?.data?.message || "Could not delete comment");
            throw error;
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// Vote on a comment
export const voteComment = createAsyncThunk(
    'comments/vote',
    async ({ commentId, voteType }: { commentId: string; voteType: 'upvote' | 'downvote' }, { getState }) => {
        try {
            const state = getState() as any;
            const { token } = state.auth;
            
            const response = await apiConnector(
                "POST",
                VOTE_COMMENT(commentId),
                { voteType },
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            // Don't show toast for voting actions to avoid spam
            return { commentId, voteType, ...response.data };
        } catch (error: any) {
            console.log("VOTE COMMENT API ERROR............", error);
            toast.error(error.response?.data?.message || "Could not vote on comment");
            throw error;
        }
    }
);
