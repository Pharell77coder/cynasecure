"use client";

import { Admin, Resource, ListGuesser, EditGuesser } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";

const dataProvider = simpleRestProvider("http://localhost:8000/api");

export default function AdminApp() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="users" list={ListGuesser} edit={EditGuesser} />
    </Admin>
  );
}