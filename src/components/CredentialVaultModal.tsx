import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { encryptSecret } from '../utils/crypto';

export interface VaultCredentialItem {
  id: string;
  name: string;
  type: 'mongodb' | 'postgres' | 'openai' | 'slack' | 'github' | 'generic';
  maskedValue: string;
  encrypted: string;
}

interface CredentialVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: VaultCredentialItem[];
  onAddCredential: (cred: VaultCredentialItem) => void;
  onDeleteCredential: (id: string) => void;
}

export const CredentialVaultModal: React.FC<CredentialVaultModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onAddCredential,
  onDeleteCredential,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<VaultCredentialItem['type']>('mongodb');
  const [secretValue, setSecretValue] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim() || !secretValue.trim()) return;

    const { encrypted } = encryptSecret(secretValue);
    const masked = secretValue.length > 8
      ? `${secretValue.slice(0, 4)}...${secretValue.slice(-4)}`
      : '••••••••';

    const newItem: VaultCredentialItem = {
      id: `cred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      maskedValue: masked,
      encrypted,
    };

    onAddCredential(newItem);
    setName('');
    setSecretValue('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Icons.ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AES-256 Encrypted Credential Vault</h3>
              <p className="text-[11px] text-gray-400">Manage encrypted API keys, database connection strings & OAuth tokens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#0D0E12]">
          {/* Add New Credential Form */}
          <div className="p-4 rounded-xl bg-[#161824] border border-white/10 space-y-3">
            <span className="text-xs font-semibold text-gray-200 block">
              Add New Encrypted Credential
            </span>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Credential Label (e.g. Prod Mongo DB)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
              >
                <option value="mongodb">MongoDB Connection URI</option>
                <option value="postgres">PostgreSQL Connection String</option>
                <option value="openai">OpenAI API Key</option>
                <option value="slack">Slack Webhook URL</option>
                <option value="github">GitHub Personal Access Token</option>
                <option value="generic">Generic API Secret</option>
              </select>
            </div>

            <input
              type="password"
              placeholder="Secret Value (Connection String / Key)"
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              className="w-full bg-[#1A1D2B] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={handleSave}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Icons.Lock className="w-3.5 h-3.5" />
              Encrypt & Store Credential
            </button>
          </div>

          {/* List of Stored Credentials */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Stored Credentials ({credentials.length})
            </h4>

            {credentials.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 italic">
                No credentials stored in vault yet.
              </div>
            ) : (
              credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-3.5 rounded-xl bg-[#161824] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400">
                      <Icons.Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white">{cred.name}</h5>
                        <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {cred.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                        {cred.maskedValue} (AES-256 Protected)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCredential(cred.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
