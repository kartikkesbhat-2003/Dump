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
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-background/95 to-black px-3 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div
          className="absolute left-1/2 top-[-25%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-[260px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-15%] h-[28rem] w-[28rem] rounded-full blur-[200px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-6 text-white">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to feed
          </Button>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Compose</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/45">New transmission</p>
          <h1 className="mt-2 text-2xl font-extralight">What's your dump today?</h1>
          <p className="mt-2 text-sm text-white/65">Keep it raw, keep it brief, keep it in the stream.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="Give this drop a headline"
                disabled={formState.isLoading}
                className={`h-12 rounded-xl border-white/20 bg-white/5 text-base text-white placeholder:text-white/40 focus-visible:ring-white/40 ${formState.errors.title ? 'border-red-400/60' : ''}`}
              />
              {formState.errors.title && (
                <p className="text-sm text-red-300">{formState.errors.title}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="content" className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                Body
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={handleInputChange('content')}
                placeholder="Drop the thought exactly as it sits in your head."
                rows={6}
                disabled={formState.isLoading}
                className={`rounded-2xl border-white/20 bg-white/5 p-4 text-sm text-white placeholder:text-white/40 focus-visible:ring-white/40 ${formState.errors.content ? 'border-red-400/60' : ''}`}
              />
              {formState.errors.content && (
                <p className="text-sm text-red-300">{formState.errors.content}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                  Image (optional)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formState.isLoading}
                  className="rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Image className="mr-2 h-4 w-4" />
                  {selectedImage ? 'Change' : 'Attach'}
                </Button>
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
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover" />
                </div>
              )}

              {selectedImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  disabled={formState.isLoading}
                  className="text-sm text-white/70 underline-offset-4 hover:text-white"
                >
                  Remove attachment
                </Button>
              )}

              {formState.errors.image && (
                <p className="text-sm text-red-300">{formState.errors.image}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange('isAnonymous')}
                  disabled={formState.isLoading}
                  className="h-4 w-4 rounded border-white/30 bg-transparent text-white"
                />
                <span className="text-white">Post anonymously</span>
              </label>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">identity hidden</p>
            </div>

            {formState.errors.general && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {formState.errors.general}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={formState.isLoading}
                className="rounded-full border border-white/20 bg-transparent px-6 py-2 text-sm text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formState.isLoading || !formData.title.trim() || !formData.content.trim()}
                className="rounded-full bg-white px-6 py-2 text-sm text-black hover:bg-white/90"
              >
                {formState.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing
                  </>
                ) : (
                  'Drop it'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
