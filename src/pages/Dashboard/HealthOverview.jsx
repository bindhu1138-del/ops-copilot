// import React from 'react';
// import { Card, SectionLabel, Badge, StatusDot, MetricCard } from '../../components/UI.jsx';
// import { MOCK_SERVICES, MOCK_DEPLOYMENTS, TIMELINE_EVENTS } from '../../lib/mockData.js';

// const ALERTS = [
//   { id: 1, sev: 'critical', msg: 'payment-svc p99 latency SLA breach (1160ms > 500ms)', time: '12 min ago' },
//   { id: 2, sev: 'critical', msg: 'Circuit breaker OPEN — payment-gateway (5 failures)', time: '10 min ago' },
//   { id: 3, sev: 'warning',  msg: 'checkout-api error rate 4.1% (threshold: 2%)', time: '22 min ago' },
// ];

// function HealthBar({ value, status }) {
//   const color = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
//   return (
//     <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
//       <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
//     </div>
//   );
// }

// export default function HealthOverview() {
//   const timelineColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6' };

//   return (
//     <div>
//       {/* KPI strip */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
//         {/* <MetricCard label="Overall Uptime"  value="99.4%" delta="0.1% from yesterday" deltaDir="bad" />
//         <MetricCard label="Active Alerts"   value="3"     delta="1 new in last hour"  deltaDir="bad" />
//         <MetricCard label="MTTR Today"      value="12m"   delta="from 34m yesterday"  deltaDir="good" />
//         <MetricCard label="Deployments (24h)" value="4"   sub="Last 24 hours" /> */}
//         <MetricCard
//   label="System Health"
//   value="87/100"
//   delta="Degraded"
//   deltaDir="bad"
// />

// <MetricCard
//   label="Active Incidents"
//   value="1 P1"
//   delta="Critical"
//   deltaDir="bad"
// />

// <MetricCard
//   label="p99 Latency"
//   value="1160ms"
//   delta="+241%"
//   deltaDir="bad"
// />

// <MetricCard
//   label="Error Rate"
//   value="18.4%"
//   delta="+18.1%"
//   deltaDir="bad"
// />
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
//         {/* Service health */}
//         <Card>
//           <SectionLabel>Service health</SectionLabel>
//           {MOCK_SERVICES.map(svc => (
//             <div key={svc.name} style={{ marginBottom: 12 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
//                   <StatusDot status={svc.status} />
//                   <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{svc.name}</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                   <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{svc.instances} instances</span>
//                   <Badge variant={svc.status === 'healthy' ? 'green' : svc.status === 'warning' ? 'amber' : 'red'}>
//                     {svc.status}
//                   </Badge>
//                 </div>
//               </div>
//               <HealthBar value={svc.health} status={svc.status} />
//             </div>
//           ))}
//         </Card>

//         {/* Active alerts */}
//         <Card>
//           <SectionLabel>Active alerts</SectionLabel>
//           {ALERTS.map(a => (
//             <div key={a.id} style={{
//               padding: '10px 12px', background: a.sev === 'critical' ? '#fef2f2' : '#fffbeb',
//               borderRadius: 8, marginBottom: 8,
//               borderLeft: `3px solid ${a.sev === 'critical' ? '#ef4444' : '#f59e0b'}`,
//             }}>
//               <div style={{ fontSize: 12, color: a.sev === 'critical' ? '#991b1b' : '#92400e', lineHeight: 1.5 }}>{a.msg}</div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{a.time}</div>
//             </div>
//           ))}
//         </Card>
//       </div>
      

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
//         {/* Deployments */}
//  <Card>
//   <SectionLabel>Recent health events</SectionLabel>

//   <div
//   style={{
//     marginBottom: 10,
//     fontSize: 12,
//     color: 'var(--text-primary)',
//     fontFamily: 'var(--font-mono)'
//   }}
// >
//   🔴 payment-svc latency spike detected

//   <div
//     style={{
//       fontSize: 10,
//       color: 'var(--text-muted)',
//       marginTop: 2
//     }}
//   >
//     12 min ago
//   </div>
// </div>

// <div
//   style={{
//     marginBottom: 10,
//     fontSize: 12,
//     color: 'var(--text-primary)',
//     fontFamily: 'var(--font-mono)'
//   }}
// >
//   🟠 checkout-api error rate increased

//   <div
//     style={{
//       fontSize: 10,
//       color: 'var(--text-muted)',
//       marginTop: 2
//     }}
//   >
//     12 min ago
//   </div>
// </div>
// <div
//   style={{
//     marginBottom: 10,
//     fontSize: 12,
//     color: 'var(--text-primary)',
//     fontFamily: 'var(--font-mono)'
//   }}
// >
//    🟢 auth-svc recovered successfully

//   <div
//     style={{
//       fontSize: 10,
//       color: 'var(--text-muted)',
//       marginTop: 2
//     }}
//   >
//     12 min ago
//   </div>
// </div>

// </Card>

//         {/* Incident timeline */}
//         <Card>
//   <SectionLabel>Top degraded services</SectionLabel>

//   <div style={{
//     paddingBottom: 12,
//     borderBottom: '1px solid #e5e7eb',
//     marginBottom: 12
//   }}>
//     <div
//   style={{
//     fontWeight: 600,
//     fontSize: 12,
//     fontFamily: 'var(--font-mono)',
//     color: 'var(--text-primary)',
//     marginBottom: 4
//   }}
// >
//   payment-svc
// </div>

//     <div style={{
//       fontSize: 12,
//       color: '#ef4444'
//     }}>
//       🔴 Critical • p99 latency 1160ms • Error rate 18.4%
//     </div>
//   </div>

//   <div style={{
//     paddingBottom: 12,
//     borderBottom: '1px solid #e5e7eb',
//     marginBottom: 12
//   }}>
//     <div
//   style={{
//     fontWeight: 600,
//     fontSize: 12,
//     fontFamily: 'var(--font-mono)',
//     color: 'var(--text-primary)',
//     marginBottom: 4
//   }}
// >
//   checkout-api
// </div>

//     <div style={{
//       fontSize: 12,
//       color: '#f59e0b'
//     }}>
//       🟠 Warning • HTTP 503 responses detected
//     </div>
//   </div>

//   <div>
//     <div
//   style={{
//     fontWeight: 600,
//     fontSize: 12,
//     fontFamily: 'var(--font-mono)',
//     color: 'var(--text-primary)',
//     marginBottom: 4
//   }}
// >
//  auth-svc
// </div>
//     <div style={{
//       fontSize: 12,
//       color: '#10b981'
//     }}>
//       🟢 Healthy
//     </div>
//   </div>
// </Card>

// {/* <Card
//   style={{
//     background: '#eff6ff',
//     border: '1px solid #bfdbfe',
//     padding: '16px',
//     gridColumn: '1/-1'
//   }}
// >
//   <div
//     style={{
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 12,
//     }}
//   >
//     <SectionLabel style={{ color: '#1d4ed8', marginBottom: 0 }}>
//       ✦ AI Insight
//     </SectionLabel>

//     <Badge variant="blue">
//       92% Confidence
//     </Badge>
//   </div>

//   <div
//     style={{
//       fontSize: 13,
//       lineHeight: 1.7,
//       color: '#1e293b',
//     }}
//   >
//     <div
//       style={{
//         fontWeight: 600,
//         marginBottom: 10,
//         color: '#0f172a',
//       }}
//     >
//       Likely Root Cause Detected
//     </div>

//     <div>
//       Recent deployment <strong>v2.3.1</strong> modified the
//       database connection pool configuration, reducing the pool size
//       from <strong>50 → 20</strong>.
//     </div>

//     <div style={{ marginTop: 8 }}>
//       Shortly after deployment, connection pool exhaustion occurred,
//       causing increased query wait times, payment gateway timeouts,
//       elevated latency, and downstream <strong>HTTP 503</strong>
//       responses from <strong>checkout-api</strong>.
//     </div>

//     <div
//       style={{
//         marginTop: 12,
//         padding: '10px 12px',
//         background: '#ffffff',
//         borderRadius: 8,
//         borderLeft: '4px solid #3b82f6',
//       }}
//     >
//       <strong>Recommended Action:</strong> Restore the previous
//       connection pool size, review database connection management,
//       and validate deployment changes introduced in v2.3.1.
//     </div>
//   </div>
// </Card> */}
//         {/* <Card>
//           <SectionLabel>Incident timeline — today's P1</SectionLabel>
//           {TIMELINE_EVENTS.map((evt, i) => (
//             <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start' }}>
//               <div style={{ width: 8, height: 8, borderRadius: '50%', background: timelineColors[evt.type], marginTop: 4, flexShrink: 0 }} />
//               <div>
//                 <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginRight: 6 }}>{evt.time}</span>
//                 <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{evt.label}</span>
//               </div>
//             </div>
//           ))}
//         </Card> */}
//       </div>
//     </div>
//   );
// }



















import React from 'react';
import {
  Card,
  SectionLabel,
  Badge,
  StatusDot,
  MetricCard,
} from '../../components/UI.jsx';

import { MOCK_SERVICES } from '../../lib/mockData.js';

const ALERTS = [
  {
    id: 1,
    sev: 'critical',
    msg: 'payment-svc p99 latency SLA breach (1160ms > 500ms)',
    time: '12 min ago',
  },
  {
    id: 2,
    sev: 'critical',
    msg: 'Circuit breaker OPEN — payment-gateway (5 failures)',
    time: '10 min ago',
  },
  {
    id: 3,
    sev: 'warning',
    msg: 'checkout-api error rate 4.1% (threshold: 2%)',
    time: '22 min ago',
  },
];

function HealthBar({ value, status }) {
  const color =
    status === 'healthy'
      ? '#10b981'
      : status === 'warning'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div
      style={{
        height: 5,
        background: '#f1f5f9',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

export default function HealthOverview() {
  return (
    <div>
      {/* KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <MetricCard
          label="System Health"
          value="87/100"
          delta="Degraded"
          deltaDir="bad"
        />

        <MetricCard
          label="Active Incidents"
          value="1 P1"
          delta="Critical"
          deltaDir="bad"
        />

        <MetricCard
          label="p99 Latency"
          value="1160ms"
          delta="+241%"
          deltaDir="bad"
        />

        <MetricCard
          label="Error Rate"
          value="18.4%"
          delta="+18.1%"
          deltaDir="bad"
        />
      </div>

      {/* Service Health + Active Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <Card>
          <SectionLabel>Service health</SectionLabel>

          {MOCK_SERVICES.map((svc) => (
            <div key={svc.name} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <StatusDot status={svc.status} />

                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {svc.name}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {svc.instances} instances
                  </span>

                  <Badge
                    variant={
                      svc.status === 'healthy'
                        ? 'green'
                        : svc.status === 'warning'
                        ? 'amber'
                        : 'red'
                    }
                  >
                    {svc.status}
                  </Badge>
                </div>
              </div>

              <HealthBar
                value={svc.health}
                status={svc.status}
              />
            </div>
          ))}
        </Card>

        <Card>
          <SectionLabel>Active alerts</SectionLabel>

          {ALERTS.map((a) => (
            <div
              key={a.id}
              style={{
                padding: '10px 12px',
                background:
                  a.sev === 'critical'
                    ? '#fef2f2'
                    : '#fffbeb',
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: `3px solid ${
                  a.sev === 'critical'
                    ? '#ef4444'
                    : '#f59e0b'
                }`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color:
                    a.sev === 'critical'
                      ? '#991b1b'
                      : '#92400e',
                  lineHeight: 1.5,
                }}
              >
                {a.msg}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  marginTop: 3,
                }}
              >
                {a.time}
              </div>
            </div>
          ))}
        </Card>
      </div>

{/* Bottom Row */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  }}
>
  {/* Incident Timeline */}
  <Card>
  <SectionLabel>Incident Timeline</SectionLabel>

  {/* Deployment */}
  <div
    style={{
      display: 'flex',
      gap: 12,
      marginBottom: 18,
    }}
  >
    <div
      style={{
        width: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#10b981',
        }}
      />

      <div
        style={{
          width: 2,
          height: 40,
          background: '#e5e7eb',
          marginTop: 2,
        }}
      />
    </div>

    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        10:01 UTC
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#10b981',
        }}
      >
        Deployment v2.3.1 released
      </div>
    </div>
  </div>

  {/* DB Pool Exhausted */}
  <div
    style={{
      display: 'flex',
      gap: 12,
      marginBottom: 18,
    }}
  >
    <div
      style={{
        width: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#ef4444',
        }}
      />

      <div
        style={{
          width: 2,
          height: 40,
          background: '#e5e7eb',
          marginTop: 2,
        }}
      />
    </div>

    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        10:07 UTC
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#ef4444',
        }}
      >
        DB connection pool exhausted
      </div>
    </div>
  </div>

  {/* Circuit Breaker */}
  <div
    style={{
      display: 'flex',
      gap: 12,
      marginBottom: 18,
    }}
  >
    <div
      style={{
        width: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#ef4444',
        }}
      />

      <div
        style={{
          width: 2,
          height: 40,
          background: '#e5e7eb',
          marginTop: 2,
        }}
      />
    </div>

    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        10:13 UTC
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#ef4444',
        }}
      >
        Circuit breaker OPEN
      </div>
    </div>
  </div>

  {/* P1 Incident */}
  <div
    style={{
      display: 'flex',
      gap: 12,
    }}
  >
    <div
      style={{
        width: 12,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#f59e0b',
        }}
      />
    </div>

    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        10:18 UTC
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#f59e0b',
        }}
      >
        P1 Incident Created
      </div>
    </div>
  </div>
</Card>

  {/* Top Degraded Services */}
 <Card>
  <SectionLabel>Top Degraded Services</SectionLabel>

  {/* payment-svc */}
  <div
    style={{
      paddingBottom: 12,
      borderBottom: '1px solid #e5e7eb',
      marginBottom: 12,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          fontFamily: 'var(--font-mono)',
          color: '#ef4444',
        }}
      >
        payment-svc
      </div>

      <Badge variant="red">
        Critical
      </Badge>
    </div>

    <div
      style={{
        fontSize: 11,
        color: '#ef4444',
        lineHeight: 1.5,
      }}
    >
      p99 latency 1160ms • Error rate 18.4%
    </div>
  </div>

  {/* checkout-api */}
  <div
    style={{
      paddingBottom: 12,
      borderBottom: '1px solid #e5e7eb',
      marginBottom: 12,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          fontFamily: 'var(--font-mono)',
          color: '#f59e0b',
        }}
      >
        checkout-api
      </div>

      <Badge variant="amber">
        Warning
      </Badge>
    </div>

    <div
      style={{
        fontSize: 11,
        color: '#f59e0b',
        lineHeight: 1.5,
      }}
    >
      HTTP 503 responses detected
    </div>
  </div>

  {/* auth-svc */}
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          fontFamily: 'var(--font-mono)',
          color: '#10b981',
        }}
      >
        auth-svc
      </div>

      <Badge variant="green">
        Healthy
      </Badge>
    </div>

    <div
      style={{
        fontSize: 11,
        color: '#10b981',
        lineHeight: 1.5,
      }}
    >
      No active issues detected
    </div>
  </div>
</Card>
</div>
    </div>
  );
}