const query = `query GetBuilds($appId: String!) { app { byFullName(fullName: $appId) { builds(platform: ANDROID, limit: 1, offset: 0) { id status artifacts { buildUrl } createdAt updatedAt } } } }`;
fetch('https://api.expo.dev/graphql', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer gIBjG7gG7kmvMgw07QdKvX_CudsSbycwfIvvqrse', 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { appId: '@kushdhruv/expo-template' } })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
