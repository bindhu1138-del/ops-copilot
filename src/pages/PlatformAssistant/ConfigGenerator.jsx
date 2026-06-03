// import React, { useState } from 'react';
// import { Card, SectionLabel, Button, Spinner, Badge } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are a Configuration Generator AI for DevOps teams.
// Generate production-ready configuration files. Always output complete, valid config files.
// Include comments explaining each section. Use realistic values — no placeholder like <YOUR_VALUE>.
// Format every file in a labeled code block like: \`\`\`yaml (filename.yaml)\n...\n\`\`\``;

// const CONFIG_TYPES = [
//   { id: 'docker', label: 'docker-compose.yml', icon: '🐳', service: 'payment-svc', prompt: 'Generate a docker-compose.yml for payment-svc with Node.js app, PostgreSQL 15, Redis 7, and a health check endpoint' },
//   { id: 'ecs',    label: 'ECS Task Definition', icon: '☁',  service: 'payment-svc', prompt: 'Generate an ECS task definition JSON for payment-svc: Node.js 18, 512 CPU, 1024 MB, with CloudWatch logging, environment variables, and health check' },
//   { id: 'nginx',  label: 'nginx.conf', icon: '⚙',           service: 'checkout-api', prompt: 'Generate a production nginx.conf for checkout-api with SSL termination, rate limiting (100 req/min), upstream load balancing to 3 instances, and gzip compression' },
//   { id: 'env',    label: '.env template', icon: '🔑',        service: 'payment-svc', prompt: 'Generate a complete .env.example for payment-svc with all required variables: DB, Redis, Stripe, JWT, AWS, logging config. Include realistic values and comments.' },
//   { id: 'github', label: 'GitHub Actions CI', icon: '⚡',    service: 'payment-svc', prompt: 'Generate a GitHub Actions workflow for payment-svc: Node.js 18, lint, test, build Docker image, push to ECR, deploy to ECS. Include environment approval for production.' },
//   { id: 'k8s',    label: 'Kubernetes Deployment', icon: '⎈', service: 'payment-svc', prompt: 'Generate a Kubernetes Deployment + Service + HPA for payment-svc: 3 replicas, resource limits 500m CPU / 512Mi memory, autoscale 2-10 pods on CPU 70%' },
// ];

// function CodeBlock({ children }) {
//   return (
//     <pre style={{ background: '#0f172a', color: '#a5f3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
//       {children}
//     </pre>
//   );
// }

// function RenderResponse({ text }) {
//   if (!text) return null;
//   const parts = text.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
//       {parts.map((part, i) => {
//         if (part.startsWith('```')) return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
//         return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
//       })}
//     </div>
//   );
// }

// export default function ConfigGenerator() {
//   const [selected, setSelected] = useState(CONFIG_TYPES[0]);
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function generate(cfg) {
//     const target = cfg || selected;
//     setSelected(target);
//     setResponse('');
//     setLoading(true);
//     try {
//       await callClaudeStream({ system: SYSTEM, messages: [{ role: 'user', content: target.prompt }], maxTokens: 4096, onChunk: (_, full) => setResponse(full), onDone: () => setLoading(false) });
//     } catch (e) { setResponse(`Error: ${e.message}`); setLoading(false); }
//   }

//   function download() {
//     const ext = selected.id === 'docker' ? 'yml' : selected.id === 'ecs' ? 'json' : selected.id === 'env' ? 'example' : selected.id === 'github' ? 'yml' : selected.id === 'k8s' ? 'yaml' : 'conf';
//     const blob = new Blob([response], { type: 'text/plain' });
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = `${selected.id}-config.${ext}`;
//     a.click();
//   }

//   return (
//     <div>
//       <Card style={{ marginBottom: 16 }}>
//         <SectionLabel>Select config type</SectionLabel>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
//           {CONFIG_TYPES.map(cfg => (
//             <button key={cfg.id} onClick={() => generate(cfg)} style={{
//               display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
//               background: selected.id === cfg.id ? '#eff6ff' : 'var(--content-bg)',
//               border: `1px solid ${selected.id === cfg.id ? '#bfdbfe' : 'var(--content-border)'}`,
//               borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
//             }}>
//               <span style={{ fontSize: 16 }}>{cfg.icon}</span>
//               <div style={{ textAlign: 'left' }}>
//                 <div style={{ fontSize: 12, fontWeight: 500, color: selected.id === cfg.id ? '#1d4ed8' : 'var(--text-primary)' }}>{cfg.label}</div>
//                 <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cfg.service}</div>
//               </div>
//             </button>
//           ))}
//         </div>
//       </Card>

//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>{selected.label} — {selected.service}</SectionLabel>
//             {loading && <Spinner size={13} />}
//             {!loading && (
//               <>
//                 <Badge variant="green">Ready</Badge>
//                 <button onClick={download} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--accent-blue)', background: 'none', border: '1px solid var(--content-border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>⬇ Download</button>
//               </>
//             )}
//           </div>
//           {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Generating configuration…</div> : <RenderResponse text={response} />}
//         </Card>
//       )}
//     </div>
//   );
// }














import React, { useState } from 'react';
import { Card, SectionLabel, Button, Spinner, Badge } from '../../components/UI.jsx';
import { callClaudeStream } from '../../lib/claude.js';

const SYSTEM = `You are a Configuration Generator AI for DevOps teams.
Generate production-ready configuration files. Always output complete, valid config files.
Include comments explaining each section. Use realistic values — no placeholder like <YOUR_VALUE>.
Format every file in a labeled code block like: \`\`\`yaml (filename.yaml)\n...\n\`\`\``;

const CONFIG_TYPES = [
  { id: 'docker', label: 'docker-compose.yml', icon: '🐳', service: 'payment-svc', prompt: 'Generate a docker-compose.yml for payment-svc with Node.js app, PostgreSQL 15, Redis 7, and a health check endpoint' },
  { id: 'ecs',    label: 'ECS Task Definition', icon: '☁',  service: 'payment-svc', prompt: 'Generate an ECS task definition JSON for payment-svc: Node.js 18, 512 CPU, 1024 MB, with CloudWatch logging, environment variables, and health check' },
  { id: 'nginx',  label: 'nginx.conf', icon: '⚙',           service: 'checkout-api', prompt: 'Generate a production nginx.conf for checkout-api with SSL termination, rate limiting (100 req/min), upstream load balancing to 3 instances, and gzip compression' },
  { id: 'env',    label: '.env template', icon: '🔑',        service: 'payment-svc', prompt: 'Generate a complete .env.example for payment-svc with all required variables: DB, Redis, Stripe, JWT, AWS, logging config. Include realistic values and comments.' },
  { id: 'github', label: 'GitHub Actions CI', icon: '⚡',    service: 'payment-svc', prompt: 'Generate a GitHub Actions workflow for payment-svc: Node.js 18, lint, test, build Docker image, push to ECR, deploy to ECS. Include environment approval for production.' },
  { id: 'k8s',    label: 'Kubernetes Deployment', icon: '⎈', service: 'payment-svc', prompt: 'Generate a Kubernetes Deployment + Service + HPA for payment-svc: 3 replicas, resource limits 500m CPU / 512Mi memory, autoscale 2-10 pods on CPU 70%' },
];

const CACHE_PREFIX = 'config-generator-';
const CACHE_TTL    = 15 * 60 * 1000;

function CodeBlock({ children }) {
  return (
    <pre style={{ background: '#0f172a', color: '#a5f3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
      {children}
    </pre>
  );
}

function RenderResponse({ text }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </div>
  );
}

export default function ConfigGenerator() {
  const [selected, setSelected] = useState(CONFIG_TYPES[0]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate(cfg) {
    const target = cfg || selected;
    setSelected(target);
    setResponse('');
    setLoading(true);

    const cacheKey = CACHE_PREFIX + encodeURIComponent(target.id);

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          await new Promise(r => setTimeout(r, 120));
          setResponse(parsed.result);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Cache read failed:', err);
    }

    try {
      await callClaudeStream({
        system: SYSTEM,
        messages: [{ role: 'user', content: target.prompt }],
        maxTokens: 4096,
        onChunk: (_, full) => setResponse(full),
        onDone: (full) => {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ result: full, timestamp: Date.now() }));
          } catch (err) {
            console.error('Cache write failed:', err);
          }
          setLoading(false);
        },
      });
    } catch (e) {
      setResponse(`Error: ${e.message}`);
      setLoading(false);
    }
  }

  function download() {
    const ext = selected.id === 'docker' ? 'yml' : selected.id === 'ecs' ? 'json' : selected.id === 'env' ? 'example' : selected.id === 'github' ? 'yml' : selected.id === 'k8s' ? 'yaml' : 'conf';
    const blob = new Blob([response], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selected.id}-config.${ext}`;
    a.click();
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>Select config type</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
          {CONFIG_TYPES.map(cfg => (
            <button key={cfg.id} onClick={() => generate(cfg)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: selected.id === cfg.id ? '#eff6ff' : 'var(--content-bg)',
              border: `1px solid ${selected.id === cfg.id ? '#bfdbfe' : 'var(--content-border)'}`,
              borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{cfg.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: selected.id === cfg.id ? '#1d4ed8' : 'var(--text-primary)' }}>{cfg.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cfg.service}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>{selected.label} — {selected.service}</SectionLabel>
            {loading && <Spinner size={13} />}
            {!loading && (
              <>
                <Badge variant="green">Ready</Badge>
                <button onClick={download} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--accent-blue)', background: 'none', border: '1px solid var(--content-border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>⬇ Download</button>
              </>
            )}
          </div>
          {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Generating configuration…</div> : <RenderResponse text={response} />}
        </Card>
      )}
    </div>
  );
}