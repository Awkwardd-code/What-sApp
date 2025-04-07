/** @type {import('next').NextConfig} */
/* const nextConfig = {
    images: {
        domains: ['aromatic-sturgeon-534.convex.cloud'],
    },
};

export default nextConfig; */
const nextConfig = {
	images: {
		remotePatterns: [
			{ hostname: "aromatic-sturgeon-534.convex.cloud" },
			// { hostname: "oaidalleapiprodscus.blob.core.windows.net" },
		],
	},
};

export default nextConfig;