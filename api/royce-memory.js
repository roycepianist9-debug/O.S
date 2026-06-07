import postgres from "postgres";

const memoryKey = "primary";

let sqlClient;

function getSqlClient() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  sqlClient ??= postgres(databaseUrl, {
    max: 1,
    ssl: "require",
  });

  return sqlClient;
}

async function ensureMemorySchema(sql) {
  await sql`create extension if not exists "pgcrypto"`;

  await sql`
    create table if not exists royce_operating_memory (
      memory_key text primary key default 'primary',
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists royce_actions (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      action_type text not null default 'Update',
      source_text text,
      status text not null default 'Logged',
      data jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists royce_ai_tips (
      id uuid primary key default gen_random_uuid(),
      page text not null,
      section text,
      label text not null default 'AI Plan',
      content text not null,
      data jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      dismissed_at timestamptz
    )
  `;
}

function parseBody(body) {
  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
}

function isRoyceData(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.profile &&
      Array.isArray(value.goals) &&
      Array.isArray(value.monthlyExpenses) &&
      Array.isArray(value.plannedCities),
  );
}

export default async function handler(request, response) {
  const sql = getSqlClient();

  if (!sql) {
    response.status(503).json({
      error: "SUPABASE_DATABASE_URL is not configured.",
      mode: "local",
    });
    return;
  }

  await ensureMemorySchema(sql);

  if (request.method === "GET") {
    const rows = await sql`
      select data, updated_at
      from royce_operating_memory
      where memory_key = ${memoryKey}
      limit 1
    `;

    response.status(200).json({
      data: rows[0]?.data ?? null,
      mode: "supabase",
      updatedAt: rows[0]?.updated_at ?? null,
    });
    return;
  }

  if (request.method === "POST") {
    const body = parseBody(request.body);

    if (!isRoyceData(body?.data)) {
      response.status(400).json({ error: "Invalid Royce OS memory payload." });
      return;
    }

    const rows = await sql`
      insert into royce_operating_memory (memory_key, data, updated_at)
      values (${memoryKey}, ${JSON.stringify(body.data)}::jsonb, now())
      on conflict (memory_key)
      do update set data = excluded.data, updated_at = now()
      returning updated_at
    `;

    response.status(200).json({
      mode: "supabase",
      updatedAt: rows[0]?.updated_at ?? null,
    });
    return;
  }

  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ error: "Method not allowed." });
}
