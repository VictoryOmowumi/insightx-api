const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldap://10.10.15.50:389', 
  timeout: 10000, 
});

// Handle LDAP client errors
client.on('error', (err) => {
  console.error('LDAP client error:', err);
});

// Perform an anonymous bind
client.bind('', '', (err) => {
  if (err) {
    console.error('LDAP anonymous bind failed:', err);
  } else {
    console.log('LDAP anonymous bind successful');
  }
  client.unbind(); 
});