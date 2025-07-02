export interface Notification {
  id: string;
  type: 'mention_post' | 'mention_comment' | 'mention_chat';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  postId: string; // ID of the post or message where the mention happened
  textSnippet: string; // A snippet of the post/comment
  timestamp: any; // Can be Timestamp or serverTimestamp()
  read: boolean;
}
