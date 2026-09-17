const fs = require('fs');
let code = fs.readFileSync('./cognitive/src/components/voice/VoicePackModal.tsx', 'utf-8');

code = code.replace(/<Download className="w-4 h-4" \/>\s*<span>Download<\/span>/g, '<Check className="w-4 h-4" /><span>Activate</span>');
code = code.replace(/<RefreshCw className="w-4 h-4 animate-spin" \/>\s*<span>Downloading \(\w+\.\w+\.\.\.\)/g, '<RefreshCw className="w-4 h-4 animate-spin" /><span>Activating...</span>');

fs.writeFileSync('./cognitive/src/components/voice/VoicePackModal.tsx', code);
console.log('Voice UI patched');
