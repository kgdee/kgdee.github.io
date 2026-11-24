const Firebase = (() => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: CONFIG.FIREBASE_API_KEY,
    authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
    projectId: CONFIG.FIREBASE_PROJECT_ID,
    storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: CONFIG.FIREBASE_MESSAGING_SENDER_ID,
    appId: CONFIG.FIREBASE_APP_ID,
  };

  let app;
  let db;
  let auth;

  let unsubscribe = { posts: null, users: null, user: null };

  // Initialize Firebase
  async function init() {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    
    // Listen for auth state changes
    // auth.onAuthStateChanged((user) => {});
  }

  async function signInWithCustomToken(token) {
    try {
      await auth.signInWithCustomToken(token);

      // Remove token from URL bar for security/cleanliness
      const url = new URL(window.location.href);
      url.searchParams.delete("custom_token");
      window.history.replaceState({}, document.title, url.toString());
    } catch (error) {
      handleError(error);
    }
  }

  function getCollection(name) {
    return db.collection(`projects/${PROJECT_NAME}/${name}`);
  }

  async function docExists(collectionName, id) {
    const docSnap = await getCollection(collectionName).doc(id).get();
    if (!docSnap.exists) return false;
    return true;
  }

  async function getTotalDocuments(collectionPath) {
    try {
      const snapshot = await db.collection(collectionPath).get();

      return snapshot.size;
    } catch (error) {
      handleError(error);
    }
  }

  function getUserName() {
    const user = currentUser;
    return user.name || user.displayName || user.email || "Anonymous User";
  }

  function getUserAvatarUrl() {
    return currentUser.avatarUrl || currentUser.photoURL || null;
  }

  async function logout() {
    try {
      await auth.signOut();
      notify("Logged out successfully.");
    } catch (error) {
      handleError(error);
    }
  }

  async function setAuthUserRole(targetUid, newRole) {
    const idToken = await currentAuthUser.getIdToken();

    const response = await fetch(`https://kgdee-firebase-functions.netlify.app/.netlify/functions/set-auth-user-role?target_uid=${targetUid}&new_role=${newRole}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    console.log("Auth user role set successfully.");
    return data;
  }

  async function getTotalAuthUsers() {
    const apiUrl = "https://kgdee-firebase-functions.netlify.app/.netlify/functions/count-auth-users";
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(data.error || "Failed to get total auth users.");
    }

    const data = await response.json();

    return data.totalUsers;
  }

  async function clearAuthUsers() {
    try {
      // Get the Firebase ID token (forces a refresh if expired)
      const token = await currentAuthUser.getIdToken();
      const apiUrl = "https://kgdee-firebase-functions.netlify.app/.netlify/functions/clear-auth-users";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(data.error || "Failed to clear auth users.");
      }

      const result = await response.json();

      notify("Auth users cleared successfully.");
    } catch (error) {
      handleError(error);
    }
  }

  async function createDocument(documentPath) {
    try {
      await db.doc(documentPath).set({});

      notify("Document created successfully.");
    } catch (error) {
      handleError(error);
    }
  }

  async function getDocument(path) {
    try {
      const docSnap = await db.doc(path).get();

      if (docSnap.exists) {
        const docData = docSnap.data();
        const document = { id: docSnap.id, ...docData };

        return document;
      }

      return null;
    } catch (error) {
      handleError(error);
    }
  }

  async function getDocuments(collectionPath) {
    try {
      const documentsQS = await db.collection(collectionPath).get();

      const documents = documentsQS.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      return documents;
    } catch (error) {
      handleError(error);
    }
  }

  function loadDocuments(collectionPath, onLoaded) {
    let documentsRef = db.collection(collectionPath);

    if (unsubscribe.documents) unsubscribe.documents();
    unsubscribe.documents = documentsRef.onSnapshot(
      (snapshot) => {
        let documents = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });

        onLoaded(documents);
      },
      (error) => {
        handleError(error);
      },
    );
  }

  // async function setDocument(path, data) {
  //   try {
  //     const docRef = db.doc(path);

  //     // Find and upload any property whose value is a File
  //     const uploadPromises = Object.keys(data).map(async (key) => {
  //       if (data[key] instanceof File) {
  //         const userId = data.authorId || currentAuthUser.uid;
  //         const path = `${userId}/posts/${docRef.id}/image.png`;
  //         console.log("data[key]", data[key]);
  //         data[key] = await Supabase.uploadFile(data[key], path);
  //         console.log("data[key]", data[key]);
  //       }
  //     });

  //     // Wait for all file uploads to complete
  //     await Promise.all(uploadPromises);

  //     data.timestamp = firebase.firestore.FieldValue.serverTimestamp();

  //     await docRef.set(data);

  //     notify("Document updated successfully.");
  //   } catch (error) {
  //     handleError(error);
  //   }
  // }

  // Set document including its id and handle file uploads
  async function setDocument(path, updates = {}) {
    const oldDocRef = db.doc(path);
    const currentId = oldDocRef.id;
    const parentColRef = oldDocRef.parent;

    const { id: newId, ...data } = updates;

    // Find and upload any property whose value is a File
    const uploadPromises = Object.keys(data).map(async (key) => {
      if (data[key] instanceof File) {
        const userId = data.authorId || currentAuthUser.uid;
        const path = `${userId}/posts/${docRef.id}/image.png`;
        data[key] = await Supabase.uploadFile(data[key], path);
      }
    });
    // Wait for all file uploads to complete
    await Promise.all(uploadPromises);

    if (!newId || newId === currentId) {
      // Same ID: standard update
      await oldDocRef.set(data);
    } else {
      // Different ID: read existing doc -> write new doc -> delete old doc
      const oldDocSnap = await oldDocRef.get();
      const newDocRef = parentColRef.doc(newId);

      const mergedData = {
        ...oldDocSnap.data(),
        ...data,
      };

      const batch = db.batch();
      batch.set(newDocRef, mergedData);
      batch.delete(oldDocRef);
      await batch.commit();
    }

    notify("Document set successfully.");
  }

  async function deleteDocument(path) {
    try {
      const docRef = db.doc(path);
      await docRef.delete();

      notify("Document deleted successfully.");
      return true;
    } catch (error) {
      handleError(error);
    }
  }

  async function listCollections(documentPath) {
    try {
      const encodedPath = encodeURIComponent(documentPath);
      const apiUrl = `https://kgdee-firebase-functions.netlify.app/.netlify/functions/list-collections?path=${encodedPath}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      return data.collections;
    } catch (error) {
      handleError(error);
    }
  }

  async function deleteItem(path) {
    try {
      if (!currentAuthUser) {
        throw new Error("Failed to delete item: Authentication required.");
      }

      // Get the Firebase ID token (forces a refresh if expired)
      const token = await currentAuthUser.getIdToken();
      const url = `https://kgdee-firebase-functions.netlify.app/.netlify/functions/delete-store-item?path=${encodeURIComponent(path)}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete item.");
      }

      notify("Item deleted successfully.");
    } catch (error) {
      handleError(error);
    }
  }

  return {
    init,
    auth,
    logout,
    setAuthUserRole,
    getTotalAuthUsers,
    clearAuthUsers,
    getTotalDocuments,
    createDocument,
    getDocument,
    getDocuments,
    loadDocuments,
    setDocument,
    deleteDocument,
    listCollections,
    deleteItem,
  };
})();
