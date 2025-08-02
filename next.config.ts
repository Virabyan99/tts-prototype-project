const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(withNextIntl({
  typescript: {
    ignoreBuildErrors: true,
  },
}));