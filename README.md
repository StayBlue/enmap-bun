# Enmap Bun

<div align="center">
  <p><img src="https://enmap.alterion.dev/assets/enmap-logo.svg" alt="Enmap Logo" /></p>
</div>

Enmap Bun is a Bun-focused fork of Enmap. It keeps the current TypeScript API and documentation structure while moving persistence to `bun:sqlite`.

Enmap Bun is:

- **Anti-ORM**, in that it can store any serializable data, and each value can be of a different shape. Compared to an ORM which strictly defines a shape for your data.
- Fully **typescript compatible**. Accepts generics if you _do_ want to define a data shape for your own code. Return values are properly typed according to your generics if provided.
- **Synchronous**. Meaning, it doesn't use callbacks or promises, no await, no .then, just call the method and go. This is powered by `bun:sqlite`.
- Focused on **Bun-first persistence** while preserving the modern Enmap surface area from `main`.

## Documentation

- [Installation](./docs/install/README.md)
- [Basic Setup](./docs/usage/README.md)
- [API Reference](./docs/api.md)

## Support

Open an issue in the [StayBlue/enmap-bun](https://github.com/StayBlue/enmap-bun/issues) repository.

## FAQs

### Q: What is "Persistent"?

**A**: By using a database layer with `bun:sqlite`, any data added to the Enmap is stored in a local database. This means that
when you restart your project, your data is not lost and is loaded on startup.

### Q: How big can the Enmap be?

**A**: Theoretically there is no limit to how much data you can store, except for the file system limitations. In most cases, it's not something you need to worry about.

### Q: Who did you make this for?

**A**: Enmap was made specifically for beginners in mind. It's for you, the budding javascript developer that wants to save data
in a database but doesn't want to learn SQL - yet. It's also for people that want to rapidly prototype some app that depends on
a database but doesn't want to have to deal with queries, even if it's not the most efficient way to do things.

### Q: What can it be used for?

**A**: Enmap is useful for storing very simple key/value data for easy retrieval, and also for more complex objects with many properties.
Mainly, because of who I originally made this for, it's used in Discord.js Bots to save currencies, content blocks, server settings, and
user information for bans, blacklists, timers, warning systems, etc.

## Testimonials

Some user comments!

> I have legit tried several databases, from popular complicated ones to pretty basic ones. The only database I had absolutely no issue with was and still is enmap.

> I know how to use a real db, but enmap is so sweet and easy to use

> Thanks to Enmap, I am able to do tons of things that I never thought I would accomplish.
> From custom settings to even just saving the little things, it is amazing to use.

> Enmap helped me, and it stills helps me, because it is very simple and useful. Thank you for creating Enmap.

> Without your tutorials I didn't have an internship and some work.. :))

> Enmap was introduced to me fairly early, and has been essential to the growth and development of my bot. Without it, I'd have to use and learn complicated and unsafe systems. Enmap has helped me do exactly what I want with my bot. Thank you.
