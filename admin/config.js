/**
 * Copy this file to config.js and set your own password hash.
 * Generate a hash (replace YOUR_PASSWORD):
 *
 *   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
 */
window.ADMIN_CONFIG = {
    passwordHash: '054eff6ef923797ac42d1ea652d4d204fef31a08b449a43c74e58047a0e091e6'
};
