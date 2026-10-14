import { spawn } from 'node:child_process';

// Read the private setting in memory; never print it or put it in a URL.
const passcode = process.env.ADMIN_PASSCODE;
if (!passcode || passcode.length < 16) {
  console.log('Ask Codex to finish setting up your private owner passcode.');
  process.exitCode = 1;
} else {
  const copier = spawn('pbcopy', [], { stdio: ['pipe', 'ignore', 'ignore'] });
  copier.on('error', () => {
    console.log('Could not copy your passcode. Ask Codex to help open your owner controls.');
    process.exitCode = 1;
  });
  copier.stdin.on('error', () => {});
  copier.stdin.end(passcode);
  copier.on('close', (code) => {
    if (code !== 0) return;
    console.log('Your owner passcode is copied. Paste it into the owner page and unlock.');
    console.log('Start Mythos.Guide first if the page is unavailable.');
    const opener = spawn('open', ['http://localhost:3000/owner.html'], { stdio: 'ignore' });
    opener.on('error', () => {
      console.log('Open http://localhost:3000/owner.html in your browser.');
    });
  });
}
