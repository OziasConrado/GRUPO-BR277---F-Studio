
export interface Notification {
  id: string;
  type: 'mention_post' | 'mention_comment' | 'mention_chat' | 'mention_story_comment' | 'new_alert';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  postId: string; // ID of the post, message, story, or alert
  textSnippet: string; // A snippet of the post/comment
  timestamp: any; // Can be Timestamp or serverTimestamp()
  read: boolean;
}
