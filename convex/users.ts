import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const createUser = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		email: v.string(),
		name: v.string(),
		image: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("users", {
			tokenIdentifier: args.tokenIdentifier,
			email: args.email,
			name: args.name,
			image: args.image,
			isOnline: true,
		});
	},
});

export const updateUser = internalMutation({
    args: { tokenIdentifier: v.string(), image: v.string() },
    async handler(ctx, args) {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();

        if (!user) {
            throw new ConvexError("User not found");
        }

        await ctx.db.patch(user._id, {
            image: args.image,
        });
    },
});

export const setUserOnline = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();

            console.log(user)

        if (!user) {
            throw new ConvexError("User not found");
        }

        await ctx.db.patch(user._id, { isOnline: true });
    },
});

export const setUserOffline = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();
        console.log(user);
        if (!user) {
            throw new ConvexError("User not found");
        }

        await ctx.db.patch(user._id, { isOnline: false });
    },
});


export const getUsers = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const users = await ctx.db.query("users").collect();
        const normalizedIdentityToken = identity.tokenIdentifier.replace(/^https?:\/\//, "");

        const everyoneExceptMe = users.filter(
            (user) => user.tokenIdentifier !== normalizedIdentityToken
        );
        return everyoneExceptMe;
    },
});

export const getMe = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }
        // console.log(identity.tokenIdentifier);
        //gentle-tarpon-23.clerk.accounts.dev|user_2vMLugBwx6JJF2E23CgI13e0dxO
        //gentle-tarpon-23.clerk.accounts.dev|user_2vMXCos222aQDA6vwmFf9v1NFr9

        /*  const user = await ctx.db
             .query("users")
             .withIndex("by_tokenIdentifier", (q) =>
                 q.eq("tokenIdentifier", identity.tokenIdentifier)
             )
             .unique();
 
         // console.log(user) */
        const cleanToken = identity.tokenIdentifier.replace(/^https?:\/\//, "");

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", cleanToken)
            )
            .unique();
        // console.log(user)

        if (!user) {
            throw new ConvexError("User not found");
        }

        return user;
    },
});



export const getGroupMembers = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const conversation = await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("_id"), args.conversationId))
            .first();
        if (!conversation) {
            throw new ConvexError("Conversation not found");
        }

        const users = await ctx.db.query("users").collect();
        const groupMembers = users.filter((user) => conversation.participants.includes(user._id));

        return groupMembers;
    },
});


