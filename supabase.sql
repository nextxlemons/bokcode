create table posts (
    id bigint generated always as identity primary key,
    username text not null,
    name text not null,
    idea text not null,
    created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "public can read"
on posts
for select
using (true);

create policy "public can insert"
on posts
for insert
with check (true);