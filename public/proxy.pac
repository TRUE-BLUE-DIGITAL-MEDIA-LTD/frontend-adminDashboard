function FindProxyForURL(url, host) {
  // 1. Bypass the proxy for internal/local network traffic
  if (
    isPlainHostName(host) ||
    shExpMatch(host, "*.local") ||
    isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
    isInNet(dnsResolve(host), "172.16.0.0", "255.240.0.0") ||
    isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0") ||
    isInNet(dnsResolve(host), "127.0.0.0", "255.255.255.0")
  ) {
    return "DIRECT";
  }

  // 2. Bypass the proxy for Apple system services and iCloud
  if (
    shExpMatch(host, "*.apple.com") ||
    shExpMatch(host, "*.icloud.com") ||
    shExpMatch(host, "*.mzstatic.com") ||
    shExpMatch(host, "*.cdn-apple.com") ||
    shExpMatch(host, "*.apple-dns.net") ||
    shExpMatch(host, "*.aaplimg.com") ||
    shExpMatch(host, "*.ls.apple.com")
  ) {
    return "DIRECT";
  }

  // 3. Route all other web traffic through your proxy
  // (Replace the URL and port with your actual proxy details)
  return "PROXY au.decodo.com:30001; DIRECT";
}
