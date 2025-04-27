# AI Task Manager

- _Date Created_: 26 April 2025
- _Host URL_: <>

## Authors

- [Shiwen(Lareina) Yang](sy796@cornell.edu)
- [](@cornell.edu)
- [](@cornell.edu)

## Starter code

daveyplate's [better-auth-nextjs-starter](https://github.com/daveyplate/better-auth-nextjs-starter) repository.

## Setup

We use docker to run the postgres db:

### Docker

You can use [Docker Desktop](https://www.docker.com/products/docker-desktop/) for this — scroll down past the "Choose plan" section. If you're on a Mac, you can also use [OrbStack](https://orbstack.dev/). On Linux, you could use [Podman](https://podman.io/) with or without [Podman Desktop](https://podman-desktop.io/).

All of these tools behave like docker, so you can (for our purposes) use them interchangeably.

Run the following command to try if Docker is working:
```bash
docker run hello-world
```

This will download ("pull") a hello-world image and execute it. You should see a message saying "Hello from Docker! This message shows that your installation appears to be working correctly."

### Dependencies

Install the dependencies:
```bash
pnpm install
```

## Development

### Hono

Run the development server:
```bash
pnpm dev
```

### DB — drizzle commands

Generate SQL files (migrations) from the drizzle schema:
```bash
pnpm db:generate
```

These files are generated in the `src/db/migrations` directory. Take a look at them to see what they contain, then you can apply them to the database.

Run the migrations, i.e. apply the generated SQL files to the database:
```bash
pnpm db:migrate
```

To check if the migrations were applied successfully, you can start Drizzle Studio, a GUI for the database:
```bash
pnpm db:studio
```

### DB — docker commands

The postgres image is already defined in the `docker-compose.yml` file.
To start the docker container with the postgres image:

```bash
docker compose up
```

Stop the docker container and remove the volume:
Careful: this will delete the database and all data in it.
```bash
docker compose down --volumes
```
Omit the `--volumes` flag if you don't want to delete the volume.


You could run these directly, or use the script shortcuts defined in the `package.json` file:

```bash
pnpm db:start  # docker compose up
pnpm db:stop   # docker compose down
pnpm db:delete # docker compose down --volumes
```