const fs = require('fs');
let code = fs.readFileSync('./cognitive/src/App.tsx', 'utf-8');

code = code.replace(
  /const handleOnline = \(\) => \{\s*setConnectivity\('SYNCING'\);\s*setTimeout\(\(\) => \{\s*OfflineStore\.clearSyncQueue\(\);\s*setConnectivity\('CONNECTED'\);\s*\}, 1500\);\s*\};/g,
  `const handleOnline = async () => {
      setConnectivity('SYNCING');
      const success = await OfflineStore.syncWithServer();
      if (success) {
         setSessions(OfflineStore.getSessions(patient.id));
      }
      setConnectivity(success ? 'CONNECTED' : 'OFFLINE');
    };`
);

code = code.replace(
  /const handleTriggerSync = \(\) => \{\s*setConnectivity\('SYNCING'\);\s*setTimeout\(\(\) => \{\s*OfflineStore\.clearSyncQueue\(\);\s*setSessions\(OfflineStore\.getSessions\(\)\);\s*setConnectivity\('CONNECTED'\);\s*\}, 1200\);\s*\};/g,
  `const handleTriggerSync = async () => {
    setConnectivity('SYNCING');
    const success = await OfflineStore.syncWithServer();
    if (success) {
       setSessions(OfflineStore.getSessions(patient.id));
    }
    setConnectivity(success ? 'CONNECTED' : 'OFFLINE');
  };`
);

fs.writeFileSync('./cognitive/src/App.tsx', code);
console.log('App patched');
