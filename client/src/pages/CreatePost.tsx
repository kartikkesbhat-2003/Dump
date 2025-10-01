import React, { useState, useRef } from 'react';
import { ArrowLeft, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost } from '@/services/operations/postAPI';

interface FormData {
  title: string;
  content: string;
  isAnonymous: boolean;
}

interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export const CreatePost: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state: any) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    isAnonymous: false,
  });
  
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    errors: {},
    touched: {},
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'isAnonymous' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formState.errors[field]) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' },
      }));
    }

    // Mark field as touched
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, image: 'Please select a valid image file' },
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, image: 'Image size must be less than 5MB' },
        }));
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear any previous image errors
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, image: '' },
      }));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters long';
    } else if (formData.content.trim().length > 2000) {
      errors.content = 'Content must be less than 2000 characters';
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      await dispatch(createPost(
        formData.title.trim(),
        formData.content.trim(),
        selectedImage || undefined,
        formData.isAnonymous
      ) as any);

      // Navigate back to feed after successful creation
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setFormState(prev => ({
        ...prev,
        errors: { general: 'Failed to create post. Please try again.' },
      }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!token) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button at Top */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">Share your thoughts with the community</p>
      </div>

      {/* Main Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter a compelling title for your post..."
              disabled={formState.isLoading}
              className={`text-lg ${formState.errors.title ? 'border-destructive' : ''}`}
            />
            {formState.errors.title && (
              <p className="text-sm text-destructive">{formState.errors.title}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={handleInputChange('content')}
              placeholder="Share your thoughts, ideas, or experiences in detail..."
              rows={8}
              disabled={formState.isLoading}
              className={`text-base ${formState.errors.content ? 'border-destructive' : ''}`}
            />
            {formState.errors.content && (
              <p className="text-sm text-destructive">{formState.errors.content}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label htmlFor="image" className="text-base font-medium">Image (Optional)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formState.isLoading}
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  {selectedImage ? 'Change Image' : 'Add Image'}
                </Button>
                {selectedImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    disabled={formState.isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove Image
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={formState.isLoading}
              />
              
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
              
              {formState.errors.image && (
                <p className="text-sm text-destructive">{formState.errors.image}</p>
              )}
              
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, GIF. Maximum file size: 5MB
              </p>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange('isAnonymous')}
              disabled={formState.isLoading}
              className="rounded h-4 w-4"
            />
            <div className="flex-1">
              <Label htmlFor="isAnonymous" className="text-base font-medium cursor-pointer">
                Post anonymously
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your post will be published without showing your username
              </p>
            </div>
          </div>

          {/* General Error */}
          {formState.errors.general && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{formState.errors.general}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={formState.isLoading}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formState.isLoading || !formData.title.trim() || !formData.content.trim()}
              className="px-8 min-w-32"
            >
              {formState.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Post...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium mb-2">Tips for a great post:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Write a clear, engaging title that summarizes your post</li>
          <li>• Provide detailed content that adds value to the discussion</li>
          <li>• Use images to enhance your message when relevant</li>
          <li>• Be respectful and follow community guidelines</li>
        </ul>
      </div>
    </div>
  );
};
