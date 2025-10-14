import { Injectable } from '@angular/core';
import {
  doc,
  docData,
  collection,
  collectionData,
  Firestore,
  runTransaction,
  updateDoc,
} from '@angular/fire/firestore';
import { getDocs, writeBatch } from 'firebase/firestore';
import type { Observable } from 'rxjs';

/**
 * Thin injectable wrapper around Firestore functions.
 * Keeps module-level firebase helpers behind a test-friendly adapter.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreAdapter {
  constructor(private firestore: Firestore) {}

  doc(path: string) {
    return doc(this.firestore, path as any) as any;
  }

  docData(ref: any, opts?: any): Observable<any> {
    return docData(ref, opts) as Observable<any>;
  }

  collection(pathOrRef: any) {
    if (typeof pathOrRef === 'string')
      return collection(this.firestore, pathOrRef as string) as any;
    // If a ref-like object is passed, return it directly (caller likely already has a ref)
    return pathOrRef as any;
  }

  collectionData(ref: any, opts?: any): Observable<any[]> {
    return collectionData(ref, opts) as Observable<any[]>;
  }

  runTransaction<T>(updater: (tx: any) => Promise<T>) {
    return runTransaction(this.firestore, updater as any) as Promise<T>;
  }

  updateDoc(ref: any, data: any) {
    return updateDoc(ref, data) as Promise<any>;
  }

  getDocs(ref: any) {
    return getDocs(ref) as Promise<any>;
  }

  writeBatch() {
    return writeBatch(this.firestore) as any;
  }
}
