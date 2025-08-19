#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Launching React Text Row Count Demo...\n');

// Check if serve is available
exec('npx serve --version', (error) => {
  if (error) {
    console.log('📦 Installing serve package...');
    exec('npm install -g serve', (installError) => {
      if (installError) {
        console.log('❌ Failed to install serve. Please run: npm install -g serve');
        process.exit(1);
      }
      launchServer();
    });
  } else {
    launchServer();
  }
});

function launchServer() {
  console.log('🌐 Starting local server...');
  
  const server = spawn('npx', ['serve', '.', '-p', '3000'], {
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Serving!')) {
      console.log('✅ Server started successfully!');
      console.log('\n📱 Demo URLs:');
      console.log('   Basic Demo: http://localhost:3000/example.html');
      console.log('   React Demo: http://localhost:3000/example-react.html');
      console.log('\n🔄 Press Ctrl+C to stop the server');
      
      // Try to open browser automatically
      openBrowser();
    }
  });

  server.stderr.on('data', (data) => {
    console.log('Server:', data.toString());
  });

  server.on('close', (code) => {
    console.log(`\n👋 Server stopped (code: ${code})`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}

function openBrowser() {
  const platform = process.platform;
  const urls = [
    'http://localhost:3000/example.html',
    'http://localhost:3000/example-react.html'
  ];

  let command;
  if (platform === 'darwin') {
    command = 'open';
  } else if (platform === 'win32') {
    command = 'start';
  } else {
    command = 'xdg-open';
  }

  // Open the basic demo first
  exec(`${command} "${urls[0]}"`, (error) => {
    if (error) {
      console.log('⚠️  Could not open browser automatically');
      console.log('   Please open: http://localhost:3000/example.html');
    } else {
      console.log('🌐 Opened basic demo in browser');
    }
  });
}
