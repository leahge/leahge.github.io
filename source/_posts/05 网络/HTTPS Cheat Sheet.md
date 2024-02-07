---
title: HTTPS Cheat Sheet
date: 2024-02-01 14:50:22
tags:
---

# HTTPS Cheat Sheet

> ## Excerpt
> All things crypto.

---
This page is intended to be a handy quick reference guide for HTTPS configuration.

  

#### Protocols

No versions of the SSL protocol are acceptable for use whilst, currently, all versions of the TLS protocol are acceptable for use. It's worth nothing that the PCI SSC will not permit the use of TLSv1 after 30th June 2018 ([source](https://blog.pcisecuritystandards.org/migrating-from-ssl-and-early-tls?ref=scotthelme.co.uk)).

**Nginx**

```
ssl_protocols TLSv1 TLSv1.1 TLSv1.2
```

**Apache**

```
SSLProtocol All -SSLv2 -SSLv3
```

  

#### Cipher Suites

Choosing ciphers suites can be difficult and their names may look complex but they can be easily broken down into their components. Take the following suite:

```
TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
```

The components are:

```
TLS - the protocol used
ECDHE - the key exchange mechanism
ECDSA - the algorithm of the authentication key
AES - the symmetric encryption algorithm
128 - the key size of the above
GCM - the mode of the above
SHA256 - the MAC used by the algorithm
```

  

##### Key exchange mechanisms

You should only support suites that use ECDHE and DHE (also referred to as EECDH and EDH) for the key exchange. The EC variant is faster and both offer [Perfect Forward Secrecy](https://scotthelme.co.uk/perfect-forward-secrecy/?ref=scotthelme.co.uk) (PFS) which is essential. An example of supporting both ECDHE and DHE with ECDHE preferred.

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
TLS_DHE_RSA_WITH_AES_128_GCM_SHA256
TLS_DHE_RSA_WITH_AES_256_GCM_SHA384
```

_Note:_ TLSv1.3 will only support PFS capable key exchange.

  

##### Authentication

The vast majority of the web will use RSA for the authentication key as it's widely supported but ECDSA is considerably faster ([source](https://scotthelme.co.uk/ecdsa-certificates/?ref=scotthelme.co.uk)). You can serve both RSA and ECDSA certificates for the best of both worlds ([tutorial](https://scotthelme.co.uk/hybrid-rsa-and-ecdsa-certificates-with-nginx/?ref=scotthelme.co.uk)). Only support suites that are appropriate to your circumstances by checking for RSA and/or ECDSA in the authentication segment.

With RSA certificate:

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
```

With ECDSA certificate:

```
TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
```

With hybrid RSA and ECDSA certificate:

```
TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
```

  

##### Cipher

In the above example AES\_128\_GCM forms the cipher. AES is the preferred algorithm and using a key size of 128bits is acceptable. You can prefer 128bit keys over 256bit keys for performance reasons. The GCM segment is the mode of the cipher and indicates that this is an AEAD (Authenticated Encryption with Associated Data). GCM suites should be prioritised over non GCM suites. An example with the GCM and non-GCM versions of the same suite.

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
TLS_ECDHE_RSA_WITH_AES_128_SHA256
TLS_ECDHE_RSA_WITH_AES_256_SHA384
```

_Note:_ TLSv1.3 will only support AEAD suites.

**Nginx**

```
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH"
```

**Apache**

```
SSLCipherSuite EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH
```

  

##### Prefer server order

When we specify the list of ciphers in our preferred order, we need to tell the server to enforce that order or it won't.

**Nginx**

```
ssl_prefer_server_ciphers on;
```

**Apache**

```
SSLHonorCipherOrder On
```

  

#### HTTP Strict Transport Security

HSTS is a HTTP response header that allows you to configure your visitor's browser to _only_ communicate with you via HTTPS, no matter what happens. No deployment of HTTPS is complete without HSTS being configured. You can read more in [HSTS - The missing link in Transport Layer Security](https://scotthelme.co.uk/hsts-the-missing-link-in-tls/?ref=scotthelme.co.uk) and I have quite a [few articles](https://scotthelme.co.uk/tag/hsts/?ref=scotthelme.co.uk) covering HSTS.

**Nginx**

```
add_header Strict-Transport-Security "max-age=600; includeSubDomains";
```

**Apache**

```
Header always set Strict-Transport-Security "max-age=600; includeSubDomains"
```

As you grow more confident with your policy you increase the size of max-age and also consider [HSTS Preloading](https://scotthelme.co.uk/hsts-preloading/?ref=scotthelme.co.uk).

  

#### OCSP Stapling

The Online Certificate Status Protocol is used to check the revocation status of a certificate. The browser makes a request to the CA to check the status of the certificate, an OCSP request, and the CA responds with an OCSP response saying the certificate is valid or revoked. This puts a burden on the client to do a DNS lookup for the CA and then the overhead of the OCSP request and also leaks the site that the client is visiting to the CA, which is a huge privacy issue. To solve this problem, [OCSP Stapling](https://scotthelme.co.uk/ocsp-stapling-speeding-up-ssl/?ref=scotthelme.co.uk) was created. When OCSP Stapling is setup, the server will do the OCSP request and then cache the OCSP response on the server. It will then 'staple' this to the certificate and send it to the client, removing the performance burden and privacy issues.

  

#### Bonus Round

There are certain performance advantages that become available to you once you serve your content over a secure connection.

**HTTP/2**

HTTP/2 is the next version of the HTTP protocol and comes with significant performance advantages. You can read more in [HTTP/2 is here!](https://scotthelme.co.uk/http-2-is-here/?ref=scotthelme.co.uk) and see my statistics that how HTTP/2 support is already widespread in [Monitoring HTTP/2 usage in the wild](https://scotthelme.co.uk/monitoring-http-2-usage-in-the-wild/?ref=scotthelme.co.uk).

**Brotli Compression**

Brotli is a new compression algorithm that has the potential to outperform gzip and also supports static compression, so you don't need to compress assets on the fly. I wrote an article about [Brotli Compression](https://scotthelme.co.uk/brotli-compression/?ref=scotthelme.co.uk) that contains details on the algorithm and how to build it into Nginx.

**SEO**

Google [recently announced](https://googleonlinesecurity.blogspot.co.uk/2014/08/https-as-ranking-signal_6.html?ref=scotthelme.co.uk) that HTTPS will be used as a ranking signal so serving over HTTPS will increase your page ranking.

There are lots of other reasons you should search over a secure connection. You can check my article [Still think you don't need HTTPS?](https://scotthelme.co.uk/still-think-you-dont-need-https/?ref=scotthelme.co.uk) and [The encrypted web is coming!](https://scotthelme.co.uk/the-encryted-web-is-coming/?ref=scotthelme.co.uk)

  

#### Useful Links

The infamous SSL Labs, check your config  
[https://www.ssllabs.com/ssltest/index.html](https://www.ssllabs.com/ssltest/index.html?ref=scotthelme.co.uk)

Check your headers for things like HSTS and HPKP  
[https://securityheaders.io/](https://securityheaders.io/?ref=scotthelme.co.uk)

Strong configurations for common servers  
[https://cipherli.st/](https://cipherli.st/?ref=scotthelme.co.uk)

Some guidance from Google on moving to HTTPS  
[https://plus.google.com/+JohnMueller/posts/PY1xCWbeDVC](https://plus.google.com/+JohnMueller/posts/PY1xCWbeDVC?ref=scotthelme.co.uk)

How Yelp migrated to HTTPS  
[https://engineeringblog.yelp.com/2016/09/great-https-migration.html](https://engineeringblog.yelp.com/2016/09/great-https-migration.html?ref=scotthelme.co.uk)

Mozilla HTTPS config generator  
[https://ssl-config.mozilla.org](https://ssl-config.mozilla.org/?ref=scotthelme.co.uk)

  

#### Warnings!

Configuring features like HSTS and HPKP can be dangerous, be sure you know what you're doing. Please do **not** copy and paste config from the internet!  
[https://scotthelme.co.uk/death-by-copy-paste/](https://scotthelme.co.uk/death-by-copy-paste/?ref=scotthelme.co.uk)

Not that there is much we can do about it, but some security features can also be used for bad things. It could be a good idea to monitor for things like this.  
[https://scotthelme.co.uk/using-security-features-to-do-bad-things/](https://scotthelme.co.uk/using-security-features-to-do-bad-things/?ref=scotthelme.co.uk)
