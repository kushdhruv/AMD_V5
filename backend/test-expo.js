const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const query = `query GetBuilds($appId: String!) { app { byFullName(fullName: $appId) { builds(platform: ANDROID, limit: 1, offset: 0) { id status artifacts { buildUrl } createdAt updatedAt } } } }`;
fetch('https://api.expo.dev/graphql', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer -j4KsL-DXm45q68DNgqMdyyUavKjJkxFAFopTJHR', 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { appId: '@kushdhruv/expo-template' } })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
