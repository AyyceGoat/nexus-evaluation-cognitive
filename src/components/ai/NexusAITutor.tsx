import { useState } from 'react';
import { extendedKnowledgeItems } from '../../data/knowledgeExtended';
import { Sparkles, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  concepts?: { term: string; definition: string }[];
  suggestedPrompts?: string[];
}

export function NexusAITutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Bonjour ! Je suis **Nexus AI**, votre tuteur d'apprentissage et d'exploration cognitive.\n\nJe peux vous expliquer n'importe quel concept complexe, vulgariser une théorie scientifique, analyser des civilisations historiques ou générer des questions d'auto-évaluation sur-mesure. De quoi aimeriez-vous discuter aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        "Explique-moi la relativité d'Einstein en termes simples",
        "Comment la crise des subprimes de 2008 s'est-elle déclenchée ?",
        "Quels sont les principes clés du stoïcisme de Marc Aurèle ?",
        "Comment fonctionne le Bitcoin et la rareté des 21 millions ?",
        "Quelles ont été les causes de la chute de l'Empire romain ?",
        "Pourquoi Alan Turing est-il le père de l'informatique moderne ?",
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'deep' | 'summary' | 'quiz'>('simple');

  // Moteur d'IA heuristique & contextuel embarqué
  const generateAIResponse = async (userQuery: string, mode: string): Promise<{ text: string; concepts?: { term: string; definition: string }[]; suggestedPrompts?: string[] }> => {
    const q = userQuery.toLowerCase();

    // Recherche de l'article correspondant le plus proche dans la base
    const matched = extendedKnowledgeItems.find(
      (item) =>
        q.includes(item.title.toLowerCase()) ||
        item.keyConcepts.some((c) => q.includes(c.term.toLowerCase())) ||
        q.includes(item.domainId.toLowerCase()) ||
        q.split(' ').some((word) => word.length > 4 && item.content.toLowerCase().includes(word))
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (matched) {
      if (mode === 'simple') {
        return {
          text: `### 💡 Explication Simplifiée : ${matched.title}\n\n${matched.summary}\n\n**Ce qu'il faut retenir en 3 points :**\n1. ${matched.keyConcepts[0]?.term || 'Principe de base'} : ${matched.keyConcepts[0]?.definition || 'Élément fondamental.'}\n2. Fonctionne de manière interconnectée dans le domaine : *${matched.domainName}*.\n3. Application pratique : Facilite la compréhension des systèmes modernes.\n\n*Souhaitez-vous approfondir les équations ou les détails historiques ?*`,
          concepts: matched.keyConcepts,
          suggestedPrompts: [
            `Approfondir les détails de ${matched.title}`,
            `Génère-moi un mini-quiz sur ${matched.title}`,
            `Quels sont les liens avec d'autres sciences ?`,
          ],
        };
      } else if (mode === 'deep') {
        return {
          text: `### 🔬 Analyse Approfondie & Détails Techniques : ${matched.title}\n\n${matched.content}\n\n**Concepts structurels associés :**\n${matched.keyConcepts.map((c) => `- **${c.term}** : ${c.definition}`).join('\n')}`,
          concepts: matched.keyConcepts,
          suggestedPrompts: [
            `Fais-moi un résumé express`,
            `Comment ce concept s'applique-t-il en Afrique ?`,
          ],
        };
      } else if (mode === 'summary') {
        return {
          text: `### 📋 Fiche de Révision Express : ${matched.title}\n\n- **Domaine** : ${matched.domainName} (${matched.category})\n- **Niveau** : ${matched.level} • **Temps de lecture** : ${matched.readTimeMinutes} min\n- **Synthèse** : ${matched.summary}\n- **Mots-clés incontournables** : ${matched.keyConcepts.map((c) => c.term).join(', ')}.`,
          concepts: matched.keyConcepts,
          suggestedPrompts: [`Poser une question spécifique`, `Passer au sujet suivant`],
        };
      } else if (mode === 'quiz') {
        const fc = matched.flashcards[0] || { front: 'Question clé', back: 'Réponse' };
        return {
          text: `### 🧠 Défi d'Auto-Évaluation : ${matched.title}\n\n**Question :** ${fc.front}\n\n*(Prenez quelques secondes pour réfléchir avant de révéler la réponse)*\n\n> 💡 **Réponse :** ${fc.back}`,
          concepts: matched.keyConcepts,
          suggestedPrompts: [`Une autre question sur ${matched.title}`, `Changer de sujet`],
        };
      }
    }

    // Réponse générique intelligente si pas de match direct
    return {
      text: `### 🧠 Analyse Nexus AI sur « ${userQuery} »\n\nCe sujet touche aux grands principes de la connaissance humaine et de la modélisation intellectuelle. Pour structurer votre exploration :\n\n1. **Approche Fondamentale** : Définissez les axiomes et les concepts clés avant toute déduction.\n2. **Perspective Transversale** : Reliez cette idée aux domaines connexes (technologie, sciences cognitives ou histoire africaine).\n3. **Application Pratique** : Testez vos connaissances grâce au module de test de QI et aux quiz du savoir.\n\nVous pouvez également explorer nos articles dédiés dans la Bibliothèque du Savoir.`,
      suggestedPrompts: [
        "Explique-moi l'architecture Transformer",
        "Parle-moi de l'Empire du Mali",
        "Comment tester mon QI ?",
      ],
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(text, explanationMode);
      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: aiResponse.text,
        concepts: aiResponse.concepts,
        suggestedPrompts: aiResponse.suggestedPrompts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Erreur
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn text-nexus-text">
      {/* En-tête Tuteur AI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-nexus-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Assistant & Tuteur d'Apprentissage
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Nexus <span className="text-gradient">AI Tutor</span>
          </h1>
        </div>

        {/* Sélecteur de Mode d'Explication */}
        <div className="flex items-center gap-1.5 bg-nexus-surface/80 p-1 rounded-2xl border border-nexus-border/60 text-xs">
          <button
            onClick={() => setExplanationMode('simple')}
            className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
              explanationMode === 'simple'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-muted hover:text-white'
            }`}
          >
            💡 Simple (ELI5)
          </button>
          <button
            onClick={() => setExplanationMode('deep')}
            className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
              explanationMode === 'deep'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-muted hover:text-white'
            }`}
          >
            🔬 Approfondi
          </button>
          <button
            onClick={() => setExplanationMode('summary')}
            className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
              explanationMode === 'summary'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-muted hover:text-white'
            }`}
          >
            📋 Fiche
          </button>
          <button
            onClick={() => setExplanationMode('quiz')}
            className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
              explanationMode === 'quiz'
                ? 'bg-nexus-accent text-white shadow-sm'
                : 'text-nexus-muted hover:text-white'
            }`}
          >
            🧠 Quiz
          </button>
        </div>
      </div>

      {/* Zone de Discussion */}
      <div className="space-y-4 mb-6 min-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            <div
              className={`p-4 sm:p-5 rounded-3xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md'
                  : 'glass-strong border border-nexus-border/60 text-nexus-text rounded-tl-sm shadow-xl'
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert prose-sm max-w-none">
                {msg.text}
              </div>

              {/* Concepts clés attachés */}
              {msg.concepts && msg.concepts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-glow">
                    Concepts Clés Définis :
                  </p>
                  {msg.concepts.map((c, i) => (
                    <div key={i} className="text-xs bg-white/5 p-2 rounded-xl border border-white/5">
                      <strong className="text-cyan-300">{c.term}</strong> : {c.definition}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions de questions rapides */}
            {msg.suggestedPrompts && (
              <div className="flex flex-wrap gap-2 mt-2.5 max-w-2xl">
                {msg.suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="px-3 py-1.5 rounded-full bg-nexus-accent/10 hover:bg-nexus-accent/20 border border-nexus-accent/30 text-nexus-glow text-[11px] font-medium transition-all text-left"
                  >
                    💬 {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 p-4 rounded-2xl glass border border-nexus-border/40 text-xs text-nexus-muted w-fit animate-fadeIn">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            <span>Nexus AI formule votre réponse...</span>
          </div>
        )}
      </div>

      {/* Barre d'Envoi du Message */}
      <div className="sticky bottom-4 p-2 rounded-2xl glass-strong border border-nexus-accent/30 shadow-2xl flex items-center gap-2">
        <input
          type="text"
          placeholder="Posez une question sur n'importe quel concept, science, empire ou idée..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-white placeholder-nexus-muted focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isTyping}
          className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
