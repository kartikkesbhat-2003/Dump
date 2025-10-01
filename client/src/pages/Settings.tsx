import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface UserSettings {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  bio: string;
  location: string;
  website: string;
  isPrivateProfile: boolean;
  allowDirectMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  autoSaveTime: number;
}

interface NotificationSettings {
  comments: boolean;
  votes: boolean;
  follows: boolean;
  mentions: boolean;
  directMessages: boolean;
  emailDigest: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showEmail: boolean;
  showOnlineStatus: boolean;
  allowTagging: boolean;
  requireApprovalForFollows: boolean;
}

export const Settings: React.FC = () => {
  const { token, user } = useSelector((state: any) => state.auth);
  
  const [settings, setSettings] = useState<UserSettings>({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    bio: '',
    location: '',
    website: '',
    isPrivateProfile: false,
    allowDirectMessages: true,
    emailNotifications: true,
    pushNotifications: true,
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    autoSaveTime: 300,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    comments: true,
    votes: true,
    follows: true,
    mentions: true,
    directMessages: true,
    emailDigest: false,
    weeklyDigest: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showOnlineStatus: true,
    allowTagging: true,
    requireApprovalForFollows: false,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserSettings();
    }
  }, [token]);

  const fetchUserSettings = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock data would be loaded here
      setLoading(false);
    }, 500);
  };

  const handleSaveSettings = async (settingsType: 'profile' | 'notifications' | 'privacy' | 'security') => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${settingsType} settings saved successfully!`);
      setHasUnsavedChanges(false);
      
      // Reset password fields
      if (settingsType === 'security') {
        setSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deletion initiated. You will receive a confirmation email.');
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    if (!settings.currentPassword) {
      toast.error('Current password is required');
      return false;
    }
    if (settings.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }
    return true;
  };

  if (!token) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Please sign in</h3>
            <p className="text-sm text-muted-foreground">
              You need to be signed in to access your settings
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, at least 256x256px
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, email: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={settings.location}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, location: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-website.com"
                    value={settings.website}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, website: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={settings.bio}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, bio: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.bio.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => {
                        setSettings(prev => ({ ...prev, theme: value }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => {
                        setSettings(prev => ({ ...prev, language: value }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('profile')} 
                  disabled={loading || !hasUnsavedChanges}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Activity Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments" className="text-sm">Comments on your posts</Label>
                      <Switch
                        id="comments"
                        checked={notificationSettings.comments}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, comments: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="votes" className="text-sm">Votes on your posts</Label>
                      <Switch
                        id="votes"
                        checked={notificationSettings.votes}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, votes: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="follows" className="text-sm">New followers</Label>
                      <Switch
                        id="follows"
                        checked={notificationSettings.follows}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, follows: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mentions" className="text-sm">Mentions in comments</Label>
                      <Switch
                        id="mentions"
                        checked={notificationSettings.mentions}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, mentions: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="directMessages" className="text-sm">Direct messages</Label>
                      <Switch
                        id="directMessages"
                        checked={notificationSettings.directMessages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, directMessages: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailDigest" className="text-sm">Daily email digest</Label>
                      <Switch
                        id="emailDigest"
                        checked={notificationSettings.emailDigest}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, emailDigest: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weeklyDigest" className="text-sm">Weekly summary</Label>
                      <Switch
                        id="weeklyDigest"
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('notifications')} 
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Notifications'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value: 'public' | 'followers' | 'private') =>
                        setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                        <SelectItem value="followers">Followers only</SelectItem>
                        <SelectItem value="private">Private - Only you can see</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showEmail" className="text-sm">Show email address on profile</Label>
                      <Switch
                        id="showEmail"
                        checked={privacySettings.showEmail}
                        onCheckedChange={(checked) =>
                          setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showOnlineStatus" className="text-sm">Show online status</Label>
                      <Switch
                        id="showOnlineStatus"
                        checked={privacySettings.showOnlineStatus}
                        onCheckedChange={(checked) =>
                          setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowTagging" className="text-sm">Allow others to tag you</Label>
                      <Switch
                        id="allowTagging"
                        checked={privacySettings.allowTagging}
                        onCheckedChange={(checked) =>
                          setPrivacySettings(prev => ({ ...prev, allowTagging: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireApproval" className="text-sm">Require approval for new followers</Label>
                      <Switch
                        id="requireApproval"
                        checked={privacySettings.requireApprovalForFollows}
                        onCheckedChange={(checked) =>
                          setPrivacySettings(prev => ({ ...prev, requireApprovalForFollows: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings('privacy')} 
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={settings.currentPassword}
                          onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={settings.newPassword}
                          onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={settings.confirmPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      if (validatePassword()) {
                        handleSaveSettings('security');
                      }
                    }}
                    disabled={loading || !settings.currentPassword || !settings.newPassword}
                    className="w-full md:w-auto"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">Danger Zone</h3>
                  <div className="p-4 border border-destructive rounded-lg space-y-3">
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};