if (!firestore) {
          // Handle the case where firestore is null, perhaps return or throw an error
          console.error("Firestore is not initialized.");
          return; 
        }
        const postRef = doc(firestore, 'posts', postId);
        const voteRef = doc(firestore, 'posts', postId, 'userVotes', currentUser.uid);

        try {
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
