import { 
  TrendingUp, 
  Users, 
  Hash, 
  MoreHorizontal,
  UserPlus,
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSelector } from "react-redux";

interface TrendingTopic {
  tag: string;
  posts: number;
  category: string;
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isFollowing: boolean;
}

export const RightNav = () => {
  const { token } = useSelector((state: any) => state.auth);

  // Don't show if not authenticated
  if (!token) return null;

  const trendingTopics: TrendingTopic[] = [
    { tag: "WebDevelopment", posts: 1250, category: "Technology" },
    { tag: "ReactJS", posts: 980, category: "Programming" },
    { tag: "AI", posts: 2100, category: "Technology" },
    { tag: "OpenSource", posts: 750, category: "Development" },
    { tag: "JavaScript", posts: 1850, category: "Programming" },
  ];

  const suggestedUsers: SuggestedUser[] = [
    { 
      id: "1", 
      name: "John Doe", 
      username: "johndoe", 
      avatar: "", 
      isFollowing: false 
    },
    { 
      id: "2", 
      name: "Sarah Wilson", 
      username: "sarahw", 
      avatar: "", 
      isFollowing: false 
    },
    { 
      id: "3", 
      name: "Mike Chen", 
      username: "mikechen", 
      avatar: "", 
      isFollowing: false 
    },
  ];

  const handleFollowUser = (userId: string) => {
    console.log(`Following user ${userId}`);
  };

  return (
    <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-background border-l border-border z-40 hidden lg:flex flex-col">
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
        
        {/* Trending Topics */}
        <Card className="mx-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              What's happening
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {trendingTopics.slice(0, 3).map((topic, index) => (
                <div 
                  key={index}
                  className="hover:bg-accent rounded-lg p-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Trending in {topic.category}
                      </p>
                      <p className="font-medium text-sm flex items-center gap-1 truncate">
                        <Hash className="h-3 w-3 flex-shrink-0" />
                        {topic.tag}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {topic.posts.toLocaleString()} posts
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="ghost" className="w-full justify-start text-primary text-sm h-8">
                Show more
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Users */}
        <Card className="mx-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Who to follow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {suggestedUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={user.isFollowing ? "secondary" : "default"}
                    onClick={() => handleFollowUser(user.id)}
                    className="ml-2 text-xs h-7 px-2 flex-shrink-0"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
              
              <Button variant="ghost" className="w-full justify-start text-primary text-sm h-8">
                Show more
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mx-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Privacy Policy</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Learn about our privacy practices
                  </p>
                </div>
                <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Terms of Service</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Review our terms and conditions
                  </p>
                </div>
                <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Help Center</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Get help and support
                  </p>
                </div>
                <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>&copy; 2024 Your App. All rights reserved.</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};
