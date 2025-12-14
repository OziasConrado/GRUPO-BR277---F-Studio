
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/client';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import PostCard, { type PostCardProps } from '@/components/feed/post-card';
import StoryCircle, { type StoryData } from '@/components/stories/StoryCircle';
import StoryViewerModal from '@/components/stories/StoryViewerModal';
import HomeAlertCard, { type HomeAlertCardData } from '@/components/alerts/home-alert-card';

export default function FeedPage() {
  const { currentUser, isAuthenticating } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [alerts, setAlerts] = useState<HomeAlertCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryData | null>(null);

  useEffect(() => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro de Conexão', description: 'Não foi possível conectar ao banco de dados.' });
      setLoading(false);
      return;
    }

    setLoading(true);

    const postsQuery = query(
      collection(firestore, 'posts'),
      where('deleted', '!=', true),
      orderBy('deleted', 'asc'),
      orderBy('timestamp', 'desc')
    );

    const storiesQuery = query(
      collection(firestore, 'reels'),
      where('deleted', '!=', true),
      orderBy('deleted', 'asc'),
      orderBy('timestamp', 'desc')
    );
    
    const alertsQuery = query(
        collection(firestore, 'alerts'),
        orderBy('timestamp', 'desc')
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatarUrl: data.userAvatarUrl,
          userLocation: data.userLocation,
          timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          text: data.text || '',
          imageUrl: data.imageUrl,
          uploadedImageUrl: data.uploadedImageUrl,
          reactions: data.reactions || { thumbsUp: 0, thumbsDown: 0 },
          bio: data.bio,
          instagramUsername: data.instagramUsername,
          cardStyle: data.cardStyle,
          edited: data.edited,
          poll: data.poll,
        } as PostCardProps;
      });
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      toast({ variant: 'destructive', title: 'Erro ao Carregar Posts', description: 'Não foi possível buscar as publicações.' });
      setLoading(false);
    });

    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const fetchedStories = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          storyType: data.storyType,
          videoContentUrl: data.videoContentUrl,
        } as StoryData;
      });
      setStories(fetchedStories);
    });
    
    const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
        const fetchedAlerts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                type: data.type || 'Alerta',
                description: `${data.location}: ${data.description}`.trim(),
                timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                userNameReportedBy: data.userNameReportedBy || 'Anônimo',
                userAvatarUrl: data.userAvatarUrl,
                userLocation: data.userLocation,
                bio: data.bio
            } as HomeAlertCardData;
        });
        setAlerts(fetchedAlerts);
    });


    return () => {
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeAlerts();
    };
  }, [toast]);

  const handleStoryClick = (story: StoryData) => {
    setSelectedStory(story);
    setIsStoryViewerOpen(true);
  };
  
  const handleAuthorClick = useCallback((authorId: string) => {
    // Logic to open user profile modal will be needed here
    console.log("Profile click:", authorId);
  }, []);

  const memoizedStories = useMemo(() => stories.map(story => (
    <StoryCircle
      key={story.id}
      {...story}
      onClick={handleStoryClick}
      onAuthorClick={() => handleAuthorClick(story.authorId)}
    />
  )), [stories, handleAuthorClick]);

  if (loading || isAuthenticating) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Stories Section */}
        {stories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold font-headline mb-3 px-4 sm:px-0">Reels</h2>
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar px-4 sm:px-0">
                {memoizedStories}
              </div>
            </div>
          </section>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
            <section>
                 <div className="flex justify-between items-center mb-3 px-4 sm:px-0">
                    <h2 className="text-xl font-bold font-headline">Alertas da Rodovia</h2>
                    <Link href="/alertas" className="text-sm text-primary font-semibold hover:underline">
                        Ver Todos
                    </Link>
                </div>
                 <div className="relative">
                     <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar px-4 sm:px-0">
                        {alerts.map(alert => <HomeAlertCard key={alert.id} alert={alert}/>)}
                    </div>
                </div>
            </section>
        )}

        {/* Feed Posts Section */}
        <section>
            <h2 className="text-xl font-bold font-headline mb-3 px-4 sm:px-0">Feed da Comunidade</h2>
            <div className="space-y-6">
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} {...post} />)
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">O feed está vazio. Seja o primeiro a postar!</p>
                </div>
            )}
            </div>
        </section>
      </div>

      {selectedStory && (
        <StoryViewerModal
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
          story={selectedStory}
        />
      )}
    </>
  );
}
