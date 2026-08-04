import { Schema, model, Document } from 'mongoose';

export type CredentialType = 'mongodb' | 'postgres' | 'openai' | 'slack' | 'github' | 'generic';

export interface ICredential extends Document {
  name: string;
  type: CredentialType;
  encryptedPayload: string;
  iv: string;
  tag: string;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, index: true },
    encryptedPayload: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
  },
  { timestamps: true }
);

export const CredentialModel = model<ICredential>('Credential', CredentialSchema);
