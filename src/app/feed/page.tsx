'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Video, MessageCircle, Route } from 'lucide-react';
import Link from 'next/link';

import PostCard, { type PostCardProps } from '@/components/feed/post-card';
import ReelCard, { type StoryData } from '@/components/stories/ReelCard';
import StoryViewerModal from '@/components/stories/StoryViewerModal';
import HomeAlertCard, { type HomeAlertCardData } from '@/components/alerts/home-alert-card';
import CreatePost from '@/components/feed/CreatePost';
import FeatureCard from '@/components/common/FeatureCard';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';

function FeedContent() {
  const { toast } = useToast();
  const { firestore } = useAuth();
  const { openChat } = useChat();

  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [alerts, setAlerts] = useState<HomeAlertCardData[]>([]);

  const [postsLoading, setPostsLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryData | null>(null);

  useEffect(() => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro de Conexão', description: 'Não foi possível conectar ao banco de dados.' });
      setPostsLoading(false);
      setStoriesLoading(false);
      setAlertsLoading(false);
      return;
    }

    // Listener for Posts
    const postsQuery = query(
      collection(firestore, 'posts'),
      where('deleted', '!=', true),
      orderBy('deleted', 'asc'),
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
      setPostsLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      toast({ variant: 'destructive', title: 'Erro ao Carregar Posts', description: 'Não foi possível buscar as publicações.' });
      setPostsLoading(false);
    });

    // Listener for Stories (Reels)
    const storiesQuery = query(
      collection(firestore, 'reels'),
      where('deleted', '!=', true),
      orderBy('deleted', 'asc'),
      orderBy('timestamp', 'desc')
    );
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
      }).filter(story => story.thumbnailUrl); // Ensure thumbnailUrl exists
      setStories(fetchedStories);
      setStoriesLoading(false);
    }, (error) => {
        console.error('Error fetching stories:', error);
        toast({ variant: 'destructive', title: 'Erro ao Carregar Stories', description: 'Não foi possível buscar os reels.' });
        setStoriesLoading(false);
    });
    
    // Listener for Alerts
    const alertsQuery = query(
        collection(firestore, 'alerts'),
        orderBy('timestamp', 'desc')
    );
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
        setAlertsLoading(false);
    }, (error) => {
        console.error('Error fetching alerts:', error);
        toast({ variant: 'destructive', title: 'Erro ao Carregar Alertas', description: 'Não foi possível buscar os alertas.' });
        setAlertsLoading(false);
    });

    return () => {
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeAlerts();
    };
  }, [toast, firestore]);

  const handleStoryClick = (story: StoryData) => {
    setSelectedStory(story);
    setIsStoryViewerOpen(true);
  };
  
  const handleAuthorClick = useCallback((authorId: string) => {
    console.log("Profile click:", authorId);
  }, []);

  const memoizedReels = useMemo(() => stories.map(story => (
    <ReelCard
      key={story.id}
      {...story}
      onClick={handleStoryClick}
      onAuthorClick={() => handleAuthorClick(story.authorId)}
    />
  )), [stories, handleAuthorClick]);

  const isLoading = postsLoading || storiesLoading || alertsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando conteúdo do feed...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        
        <Button asChild variant="destructive" className="w-full h-14 rounded-xl text-lg font-bold">
          <Link href="/emergencia">
            <Phone className="mr-3 h-6 w-6" />
            EMERGÊNCIA
          </Link>
        </Button>
        
        <div className="grid grid-cols-3 gap-2">
            <FeatureCard title="Câmeras" Icon={Video} href="/streaming" />
            <div onClick={openChat} className="h-full">
                <FeatureCard title="Comunidade" Icon={MessageCircle} href="#" />
            </div>
            <FeatureCard title="Concessões" Icon={Route} href="/sau" />
        </div>

        <CreatePost />

        {stories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold font-headline mb-3 px-4 sm:px-0">Reels</h2>
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                {memoizedReels}
              </div>
            </div>
          </section>
        )}

        {alerts.length > 0 && (
            <section>
                 <div className="flex justify-between items-center mb-3 px-4 sm:px-0">
                    <h2 className="text-xl font-bold font-headline">Alertas da Rodovia</h2>
                    <Link href="/alertas" className="text-sm text-primary font-semibold hover:underline">
                        Ver Todos
                    </Link>
                </div>
                 <div className="relative">
                     <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                        {alerts.map(alert => <HomeAlertCard key={alert.id} alert={alert}/>)}
                    </div>
                </div>
            </section>
        )}

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


export default function FeedPage() {
    const { isAuthenticating } = useAuth();
  
    if (isAuthenticating) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Autenticando...</p>
        </div>
      );
    }
  
    return <FeedContent />;
}
