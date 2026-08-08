import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { encryptSecret } from '../utils/crypto';

export interface VaultCredentialItem {
  id: string;
  name: string;
  type: 'mongodb' | 'postgres' | 'openai' | 'gemini' | 'anthropic' | 'slack' | 'github' | 'discord' | 'redis' | 'generic';
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
  const [type, setType] = useState<VaultCredentialItem['type']>('openai');
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Icons.ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">AES-256 Encrypted Credential Vault</h3>
              <p className="text-[11px] text-slate-500">Manage encrypted API keys, database connection strings & OAuth tokens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          {/* Add New Credential Form */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-900 block font-heading">
              Add New Encrypted Credential
            </span>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Credential Label (e.g. OpenAI Production Key)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all shadow-2xs"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all shadow-2xs font-medium"
              >
                <option value="openai">OpenAI API Key (sk-proj-...)</option>
                <option value="gemini">Google Gemini API Key (AIzaSy...)</option>
                <option value="anthropic">Anthropic Claude Key (sk-ant...)</option>
                <option value="mongodb">MongoDB Connection URI</option>
                <option value="postgres">PostgreSQL Connection String</option>
                <option value="slack">Slack Webhook / Bot Token</option>
                <option value="discord">Discord Webhook Secret</option>
                <option value="github">GitHub Personal Access Token</option>
                <option value="generic">Generic API Secret / Header</option>
              </select>
            </div>

            <input
              type="password"
              placeholder="Secret Value (Connection String / Key)"
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-emerald-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all shadow-2xs"
            />

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Icons.Lock className="w-3.5 h-3.5" />
              Encrypt & Store Credential
            </button>
          </div>

          {/* List of Stored Credentials */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
              Stored Credentials ({credentials.length})
            </h4>

            {credentials.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 italic">
                No credentials stored in vault yet.
              </div>
            ) : (
              credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                      <Icons.Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-900 font-heading">{cred.name}</h5>
                        <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-200 font-bold">
                          {cred.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {cred.maskedValue} (AES-256 Protected)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCredential(cred.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
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

