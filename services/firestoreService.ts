import { firebaseConfig } from './firebaseConfig';
// FIX: Import `Visitor` and the new `Preferences` type.
import { Visitor, Preferences } from '../types';

// These type definitions describe the shape of the Firebase V8 SDK's Firestore object
// that is loaded globally from the script tag in index.html. This provides full
// type safety and autocompletion in a strict TypeScript environment.

interface FirebaseApp {
  firestore(): Firestore;
}

interface Firestore {
  collection(path: string): CollectionReference;
}

interface CollectionReference {
  where(field: string, op: string, value: any): Query;
  doc(id: string): DocumentReference;
  add(data: any): Promise<DocumentReference>;
  orderBy(field: string): Query;
  get(): Promise<QuerySnapshot>;
}

interface Query {
    get(): Promise<QuerySnapshot>;
    limit(num: number): Query;
}

interface DocumentReference {
  update(data: any): Promise<void>;
  id: string;
}

interface QuerySnapshot {
  empty: boolean;
  docs: DocumentSnapshot[];
  forEach(callback: (doc: DocumentSnapshot) => void): void;
}

interface DocumentSnapshot {
  id: string;
  data(): any;
}

interface FieldValue {
    arrayUnion(...elements: any[]): any;
    arrayRemove(...elements: any[]): any;
}

interface FirebaseNamespace {
    apps: FirebaseApp[];
    initializeApp(config: object): FirebaseApp;
    firestore: {
        (): Firestore;
        FieldValue: FieldValue;
    };
}

// This declares the `firebase` object on the global `window` scope for TypeScript.
declare global {
    interface Window {
        firebase: FirebaseNamespace;
    }
}


// Initialize Firebase safely. If it fails, the app will continue to run
// in a degraded mode without database-dependent features.
let db: Firestore | null;
let FieldValue: FieldValue | null;

try {
  // Check if Firebase config placeholders have been replaced.
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    throw new Error("Firebase configuration is using placeholder values. Please update services/firebaseConfig.ts with your actual project credentials.");
  }
  
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
  db = window.firebase.firestore();
  FieldValue = window.firebase.firestore.FieldValue;
} catch (err) {
  console.warn("Firebase initialization failed. The app will continue in a degraded mode without database features (history, personalization). Please check your `services/firebaseConfig.ts` and Firebase project settings.", err);
  db = null;
  FieldValue = null;
}

// FIX: Update the default visitor to include default model preferences.
const createDefaultVisitor = (name: string): Visitor => ({
    name,
    searches: [],
    preferences: { interests: [], textModel: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image' },
    memories: [],
});


/**
 * Gets an existing visitor by name or creates a new one if not found.
 * @param name The name of the visitor.
 * @returns A promise that resolves to the complete Visitor object.
 */
export const getOrCreateVisitor = async (name: string): Promise<Visitor> => {
    if (!db) return createDefaultVisitor(name);

    try {
        const visitorsCollection = db.collection('visitors');
        const querySnapshot = await visitorsCollection.where('name', '==', name).limit(1).get();

        if (!querySnapshot.empty) {
            const visitorDoc = querySnapshot.docs[0];
            const data = visitorDoc.data() as Visitor;
            return { 
                id: visitorDoc.id, 
                ...data,
                // FIX: Provide a complete default preferences object if one doesn't exist.
                preferences: data.preferences || { interests: [], textModel: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image' },
                memories: data.memories || []
            };
        } else {
            // FIX: Create new visitors with default model preferences.
            const newVisitorData: Omit<Visitor, 'id'> = {
                name: name,
                searches: [],
                preferences: { interests: ['AI development', 'Technology trends'], textModel: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image' },
                memories: [],
            };
            const docRef = await visitorsCollection.add(newVisitorData);
            return { id: docRef.id, ...newVisitorData };
        }
    } catch (error) {
        console.error("Error in getOrCreateVisitor (falling back to default):", error);
        return createDefaultVisitor(name);
    }
};

/**
 * Updates the preferences for a specific visitor.
 * @param visitorId The Firestore document ID of the visitor.
 * @param preferences The new preferences object to save.
 */
// FIX: Use the shared `Preferences` type for the `preferences` parameter.
export const updateVisitorPreferences = async (visitorId: string, preferences: Preferences): Promise<void> => {
    if (!db || !visitorId) return;
    try {
        const visitorDocRef = db.collection('visitors').doc(visitorId);
        await visitorDocRef.update({ preferences });
    } catch (error) {
        console.error("Error in updateVisitorPreferences:", error);
        throw new Error("Failed to save preferences to the database.");
    }
}

/**
 * Adds a new memory string to a visitor's record.
 * @param visitorId The Firestore document ID of the visitor.
 * @param memory The memory string to add.
 */
export const addMemoryToVisitor = async (visitorId: string, memory: string): Promise<void> => {
    if (!db || !FieldValue || !visitorId || !memory) return;
    try {
        const visitorDocRef = db.collection('visitors').doc(visitorId);
        await visitorDocRef.update({
            memories: FieldValue.arrayUnion(memory)
        });
    } catch (error) {
        console.error("Error in addMemoryToVisitor:", error);
        throw new Error("Failed to save memory to the database.");
    }
};

/**
 * Removes a memory string from a visitor's record.
 * @param visitorId The Firestore document ID of the visitor.
 * @param memory The memory string to remove.
 */
export const removeMemoryFromVisitor = async (visitorId: string, memory: string): Promise<void> => {
    if (!db || !FieldValue || !visitorId || !memory) return;
    try {
        const visitorDocRef = db.collection('visitors').doc(visitorId);
        await visitorDocRef.update({
            memories: FieldValue.arrayRemove(memory)
        });
    } catch (error) {
        console.error("Error in removeMemoryFromVisitor:", error);
        throw new Error("Failed to remove memory from the database.");
    }
};

/**
 * Adds a search term to a specific visitor's search history array in Firestore.
 * @param visitorId The Firestore document ID of the visitor.
 * @param search The search term to add.
 */
export const addSearchToVisitor = async (visitorId: string, search: string): Promise<void> => {
  if (!db || !FieldValue || !visitorId) return;
  try {
    const visitorDocRef = db.collection('visitors').doc(visitorId);
    await visitorDocRef.update({
      searches: FieldValue.arrayUnion(search)
    });
  } catch (error) {
    console.error("Error in addSearchToVisitor:", error);
    // Fail silently to avoid interrupting the user experience.
  }
};

/**
 * Fetches all visitor documents from the Firestore collection.
 * @returns A promise that resolves to an array of Visitor objects.
 */
export const getAllVisitors = async (): Promise<Visitor[]> => {
  if (!db) return [];
  try {
    const querySnapshot = await db.collection('visitors').orderBy('name').get();
    const visitors: Visitor[] = [];
    querySnapshot.forEach((doc: DocumentSnapshot) => {
      visitors.push(doc.data() as Visitor);
    });
    return visitors;
  } catch (error) {
    console.error("Error in getAllVisitors:", error);
    throw new Error("Could not fetch visitor data for the admin panel.");
  }
};