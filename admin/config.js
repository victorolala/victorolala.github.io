/**
 * Copy this file to config.js and set your own password hash.
 * Generate a hash (replace YOUR_PASSWORD):
 *
 *   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
 */
window.ADMIN_CONFIG = {
    passwordHash: '057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86'
};
