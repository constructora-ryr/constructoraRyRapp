--
-- PostgreSQL database dump
--

\restrict 9eLwBOidG3iCobHWsP1jAr7DaJNop6jIrJsWDK8zgFhkehDOSbuh1qiKXxrcV2z

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: permisos_rol; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.permisos_rol VALUES ('0ad21566-da56-432f-9230-b59cdd7ec1ff', 'Contabilidad', 'proyectos', 'editar', false, 'Modificar datos del proyecto', '2026-04-22 17:01:06.972783+00', '2026-04-22 18:06:08.303428+00', NULL);
INSERT INTO public.permisos_rol VALUES ('1bd74a14-e590-4dcf-8337-71f4985e6e90', 'Administrador de Obra', 'negociaciones', 'asignar', false, 'No puede asignar viviendas por defecto', '2026-04-23 14:01:28.65998+00', '2026-04-23 14:01:28.65998+00', NULL);
INSERT INTO public.permisos_rol VALUES ('cf8e25eb-1915-4c54-bdb4-6b0f6b228338', 'Gerencia', 'negociaciones', 'asignar', false, 'No puede asignar viviendas por defecto', '2026-04-23 14:01:28.65998+00', '2026-04-23 14:01:28.65998+00', NULL);
INSERT INTO public.permisos_rol VALUES ('8be8d66f-fe07-414d-897e-d0094e4f6d87', 'Contabilidad', 'negociaciones', 'asignar', false, 'Puede asignar una vivienda a un cliente', '2026-04-23 14:01:28.65998+00', '2026-04-23 20:43:00.333645+00', NULL);
INSERT INTO public.permisos_rol VALUES ('ea98bac2-0db9-4d28-be51-ba1056bbdcf0', 'Contabilidad', 'proyectos', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('86b974f9-b463-4b45-9b13-95f852911e1e', 'Contabilidad', 'proyectos', 'eliminar', false, 'Eliminar proyectos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('bdb32bdb-c5ad-4f6e-802e-ed31de457ace', 'Administrador de Obra', 'proyectos', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('832f114c-8b10-47cc-92f1-b0061bd0885c', 'Administrador de Obra', 'proyectos', 'crear', false, 'Crear nuevos proyectos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e085cc0a-3e4e-49cf-874c-7db430879d4d', 'Administrador de Obra', 'proyectos', 'editar', false, 'Modificar datos del proyecto', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e7732e0c-c1c9-46e4-9f1e-eb6331fa84d2', 'Administrador de Obra', 'proyectos', 'eliminar', false, 'Eliminar proyectos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('2f3ac1ea-0701-4330-9e4a-c362ac740ea8', 'Gerencia', 'proyectos', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('3659914f-f167-4c5f-9222-0b685624daef', 'Gerencia', 'proyectos', 'crear', false, 'Crear nuevos proyectos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('7407e9b8-cd58-4f02-80e2-02181d078ea1', 'Gerencia', 'proyectos', 'editar', true, 'Modificar datos del proyecto', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('ab75a357-3419-4b88-8dec-f0a230a72973', 'Gerencia', 'proyectos', 'eliminar', true, 'Eliminar proyectos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('8914f02c-f6fc-4fb9-a7ab-0d256a6eeaae', 'Contabilidad', 'viviendas', 'eliminar', false, 'Eliminar viviendas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f6128e6a-6fdb-493f-9a02-203372f09074', 'Administrador de Obra', 'viviendas', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('4c7c71fe-9144-4ff3-b7f9-43947c8af56d', 'Administrador de Obra', 'viviendas', 'crear', false, 'Registrar nuevas viviendas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('251b3ae2-aff6-4f2e-97ff-e3b5a4320b5f', 'Administrador de Obra', 'viviendas', 'editar', false, 'Modificar datos de la vivienda', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b0b131bf-6f11-4bbd-abce-18b1018c2633', 'Administrador de Obra', 'viviendas', 'eliminar', false, 'Eliminar viviendas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e5ec7ddb-9a12-4185-b882-b300ca6d2534', 'Gerencia', 'viviendas', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('fd4bdbb7-c42a-4455-8319-16190128b6d2', 'Gerencia', 'viviendas', 'crear', false, 'Registrar nuevas viviendas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('c71c9dcf-2c0b-4478-9903-22f6bdf4aae4', 'Gerencia', 'viviendas', 'eliminar', true, 'Eliminar viviendas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('fc8581ff-e7e7-4ac2-8519-a20212835718', 'Contabilidad', 'clientes', 'eliminar', false, 'Eliminar clientes', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f0630be1-e655-4fe6-9d48-541fe6064ddc', 'Administrador de Obra', 'clientes', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('bf19cb22-672e-444a-8f97-63f17eeff266', 'Administrador de Obra', 'clientes', 'crear', false, 'Registrar nuevos clientes', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b7a56f6b-f56a-45e3-bbf0-7c7f998754e3', 'Administrador de Obra', 'clientes', 'editar', false, 'Modificar datos del cliente', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('6da1cc28-884b-48d2-aa63-7bd0234bb979', 'Administrador de Obra', 'clientes', 'eliminar', false, 'Eliminar clientes', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('dfada31e-de6e-47a5-a2c6-0e7ed90b0c5b', 'Gerencia', 'clientes', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('36b9d3a1-e195-47fa-9c0e-99e3163183d7', 'Gerencia', 'clientes', 'crear', true, 'Registrar nuevos clientes', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('16d534dd-0d74-4d58-be32-9b98e54b6ce0', 'Gerencia', 'clientes', 'editar', true, 'Modificar datos del cliente', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('cdf43c59-c9f0-4056-8e82-c06724f0ef48', 'Gerencia', 'clientes', 'eliminar', true, 'Eliminar clientes', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b1a3b91d-4db2-4042-80c5-8d5f03c40fec', 'Administrador de Obra', 'negociaciones', 'ver', false, 'Ver tab de negociaciones del cliente', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('a95330b8-b61e-4bfb-99d2-3121a785e1f9', 'Gerencia', 'negociaciones', 'ver', true, 'Ver tab de negociaciones del cliente', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('792c8680-76a6-408b-b31c-429e28e1c486', 'Contabilidad', 'documentos', 'eliminar', false, 'Eliminar documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e38ca752-6d91-4af1-b9eb-334730fc5107', 'Administrador de Obra', 'documentos', 'editar', false, 'Renombrar y editar metadatos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('7f9cfb23-d285-43f0-a5ec-f6ce221ab304', 'Administrador de Obra', 'documentos', 'eliminar', false, 'Eliminar documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('93540209-9458-4f52-a74b-f7a2feb31598', 'Administrador de Obra', 'documentos', 'archivar', false, 'Archivar documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('26523852-0242-4111-8fdf-d7d0408cc6b0', 'Gerencia', 'documentos', 'ver', true, 'Ver tab de documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('3de98358-49ca-46e1-8e25-90ffa5f276e6', 'Gerencia', 'documentos', 'subir', true, 'Subir nuevos documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('ee87d005-4b50-42ab-8c69-dda3528f11e8', 'Gerencia', 'documentos', 'editar', true, 'Renombrar y editar metadatos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('6fb827e9-1e68-41ba-8004-4fd8f6854f38', 'Gerencia', 'documentos', 'eliminar', true, 'Eliminar documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('99f7ed38-c116-4354-920d-e1e7847254d5', 'Contabilidad', 'proyectos', 'crear', false, 'Crear nuevos proyectos', '2026-04-22 17:01:06.972783+00', '2026-04-22 18:25:29.717688+00', NULL);
INSERT INTO public.permisos_rol VALUES ('45183e96-58ef-406b-9d2e-f508fd89a6f3', 'Contabilidad', 'viviendas', 'crear', false, 'Registrar nuevas viviendas', '2026-04-22 17:01:06.972783+00', '2026-04-22 20:53:33.13144+00', NULL);
INSERT INTO public.permisos_rol VALUES ('6bd2f278-6461-49e8-bd79-7d4dcb8bf776', 'Administrador de Obra', 'documentos', 'ver', false, 'Ver tab de documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 21:24:25.203336+00', NULL);
INSERT INTO public.permisos_rol VALUES ('84b47a9f-d01f-4ae3-b669-458c262e31c6', 'Contabilidad', 'documentos', 'ver', true, 'Ver tab de documentos', '2026-04-22 17:01:06.972783+00', '2026-04-23 18:06:11.064396+00', NULL);
INSERT INTO public.permisos_rol VALUES ('4c1c5598-16c9-4e82-9aba-9b67ba2106f3', 'Contabilidad', 'clientes', 'crear', true, 'Registrar nuevos clientes', '2026-04-22 17:01:06.972783+00', '2026-04-23 18:31:30.724664+00', NULL);
INSERT INTO public.permisos_rol VALUES ('ff67d04c-6fff-4013-929b-a46af70d1b2d', 'Administrador de Obra', 'documentos', 'subir', false, 'Subir nuevos documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 21:24:25.214286+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f9da03ce-eb4a-42d0-92bd-6f68cd5f3df5', 'Contabilidad', 'clientes', 'editar', false, 'Modificar datos del cliente', '2026-04-22 17:01:06.972783+00', '2026-04-23 00:39:38.731306+00', NULL);
INSERT INTO public.permisos_rol VALUES ('22b281c7-2779-449c-97f4-1df7ad9802dd', 'Gerencia', 'viviendas', 'editar', false, 'Modificar datos de la vivienda', '2026-04-22 17:01:06.972783+00', '2026-04-23 00:52:16.937198+00', NULL);
INSERT INTO public.permisos_rol VALUES ('95aae2b2-ce69-4bec-bbd7-bfd510538d64', 'Contabilidad', 'clientes', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-23 00:39:59.288751+00', NULL);
INSERT INTO public.permisos_rol VALUES ('6dcaf53b-0b9c-4234-ba78-fa76c0ea440e', 'Contabilidad', 'viviendas', 'editar', false, 'Modificar datos de la vivienda', '2026-04-22 17:01:06.972783+00', '2026-05-14 17:09:11.650772+00', NULL);
INSERT INTO public.permisos_rol VALUES ('762cbd6a-8341-4eb7-90bf-94013491187f', 'Contabilidad', 'viviendas', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-05-15 17:50:56.569209+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f48483df-34da-46c3-b0c5-bc6495e494bc', 'Contabilidad', 'negociaciones', 'ver', true, 'Ver tab de negociaciones del cliente', '2026-04-22 17:01:06.972783+00', '2026-04-23 16:04:45.358786+00', NULL);
INSERT INTO public.permisos_rol VALUES ('7105f069-a891-4ae1-8a3b-c00d45f7d4cc', 'Contabilidad', 'documentos', 'subir', false, 'Subir nuevos documentos', '2026-04-22 17:01:06.972783+00', '2026-04-23 17:12:28.784031+00', NULL);
INSERT INTO public.permisos_rol VALUES ('8aea187f-ead9-4423-a329-87f44494813a', 'Gerencia', 'documentos', 'archivar', true, 'Archivar documentos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('9ceae9b6-037e-4bf5-a549-0f0ebdb7128e', 'Contabilidad', 'abonos', 'eliminar', false, 'Eliminar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('68743da8-dd23-4cd2-ba63-06cdd358d937', 'Administrador de Obra', 'abonos', 'ver', false, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('50af1a62-d5f7-40c9-9f46-0494a5a6a092', 'Administrador de Obra', 'abonos', 'crear', false, 'Registrar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('2123c4d2-2033-4edd-944a-09eb31fb4998', 'Administrador de Obra', 'abonos', 'editar', false, 'Modificar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b64e0ecc-b38e-4821-bc1b-e3bf42824c16', 'Administrador de Obra', 'abonos', 'eliminar', false, 'Eliminar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('c838970c-b3a9-4c8e-976e-0a08b988e357', 'Gerencia', 'abonos', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('5995ef91-1c61-42c5-a37f-0fc88efcfb68', 'Gerencia', 'abonos', 'crear', false, 'Registrar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('87e96d28-3599-450e-8a5c-ba6e20b8b0dc', 'Gerencia', 'abonos', 'editar', false, 'Modificar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('0e388aa4-322e-4dad-8ea7-09c2014269c2', 'Gerencia', 'abonos', 'eliminar', true, 'Eliminar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e5c545d3-4813-4e81-8300-b6a221da148c', 'Contabilidad', 'renuncias', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('0383e3a0-1ceb-47c1-95b5-1e1cfc90a814', 'Contabilidad', 'renuncias', 'crear', true, 'Registrar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('44e9cccf-f53e-4280-9007-a09f51f4b987', 'Contabilidad', 'renuncias', 'editar', true, 'Modificar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('dda474ac-4b12-4099-91c8-60c4c35f78dc', 'Contabilidad', 'renuncias', 'eliminar', false, 'Eliminar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('c5125f63-9eed-4f68-8a51-55b97a0caea7', 'Administrador de Obra', 'renuncias', 'ver', false, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('2601a4b7-d4c3-4bb7-b466-322022542d3e', 'Administrador de Obra', 'renuncias', 'crear', false, 'Registrar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('91353af4-57dc-4105-bbfa-c3760a46c18d', 'Administrador de Obra', 'renuncias', 'editar', false, 'Modificar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('49e405a6-bce1-4799-832f-b04e55b046ab', 'Administrador de Obra', 'renuncias', 'eliminar', false, 'Eliminar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('5b962174-2408-4aab-9b0c-55f85c7dcb00', 'Gerencia', 'renuncias', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('a9c6c0c0-0d2e-4f08-b21e-d2fd0371fcc9', 'Gerencia', 'renuncias', 'crear', true, 'Registrar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('6fd5d946-6216-4bbe-89bb-f5c8a33cbe4a', 'Gerencia', 'renuncias', 'editar', true, 'Modificar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('80e15253-66ea-419f-a1b9-9b98f9c9f77d', 'Gerencia', 'renuncias', 'eliminar', true, 'Eliminar renuncias', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e4c89993-d4df-4fc2-b01a-3e16ac621851', 'Contabilidad', 'usuarios', 'crear', false, 'Crear nuevos usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('68e48bdd-2d73-4e2e-9e13-2bab91c4e6ed', 'Contabilidad', 'usuarios', 'editar', false, 'Modificar datos y rol de usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('cc64a234-b92d-4ec5-a74b-b4e8fd6a7189', 'Contabilidad', 'usuarios', 'eliminar', false, 'Desactivar usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('5a39cb3e-b5df-40fe-b550-aa9ee99260fc', 'Administrador de Obra', 'usuarios', 'ver', false, 'Ver lista de usuarios y permisos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('c65dac4f-2c4d-4b85-9722-0f9f5d87e0ea', 'Administrador de Obra', 'usuarios', 'crear', false, 'Crear nuevos usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('42d962b2-a721-4cb4-9592-97e4d9365a13', 'Administrador de Obra', 'usuarios', 'editar', false, 'Modificar datos y rol de usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('307f921a-9484-4e03-bac7-b6af82175b02', 'Administrador', 'clientes', 'registrar_interes', true, 'Registrar y descartar intereses de clientes en viviendas', '2026-04-23 16:42:22.911681+00', '2026-04-23 16:42:22.911681+00', NULL);
INSERT INTO public.permisos_rol VALUES ('af6bf56e-254d-494a-8378-c0d63fee891c', 'Contabilidad', 'clientes', 'registrar_interes', true, 'Registrar y descartar intereses de clientes en viviendas', '2026-04-23 16:42:22.911681+00', '2026-04-23 16:42:22.911681+00', NULL);
INSERT INTO public.permisos_rol VALUES ('cabc6fe6-589c-43b8-affd-72b0998b483e', 'Administrador de Obra', 'clientes', 'registrar_interes', true, 'Registrar y descartar intereses de clientes en viviendas', '2026-04-23 16:42:22.911681+00', '2026-04-23 16:42:22.911681+00', NULL);
INSERT INTO public.permisos_rol VALUES ('2ce4e92b-c26e-429c-b07c-c80c9d2f0abd', 'Gerencia', 'clientes', 'registrar_interes', false, 'Registrar y descartar intereses de clientes en viviendas', '2026-04-23 16:42:22.911681+00', '2026-04-23 16:42:22.911681+00', NULL);
INSERT INTO public.permisos_rol VALUES ('2a72f5ad-4f2e-45c3-bdec-b56c5a015295', 'Contabilidad', 'abonos', 'crear', false, 'Registrar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-23 17:35:42.049718+00', NULL);
INSERT INTO public.permisos_rol VALUES ('89e8f6b9-b8e9-4fce-bac0-569c1fe6205a', 'Contabilidad', 'abonos', 'editar', false, 'Modificar abonos', '2026-04-22 17:01:06.972783+00', '2026-04-23 17:54:30.364717+00', NULL);
INSERT INTO public.permisos_rol VALUES ('692d4ca3-68ae-4412-a37d-5eb66ce845de', 'Contabilidad', 'documentos', 'archivar', false, 'Archivar documentos', '2026-04-22 17:01:06.972783+00', '2026-04-23 17:58:03.190541+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b93a4105-a70c-44e0-a296-2effb5e1c671', 'Contabilidad', 'documentos', 'editar', false, 'Renombrar y editar metadatos', '2026-04-22 17:01:06.972783+00', '2026-04-23 17:58:03.204468+00', NULL);
INSERT INTO public.permisos_rol VALUES ('795b82d0-c46f-49d8-ac63-5629a50c3af4', 'Contabilidad', 'usuarios', 'ver', false, 'Ver lista de usuarios y permisos', '2026-04-22 17:01:06.972783+00', '2026-04-24 16:12:17.534521+00', NULL);
INSERT INTO public.permisos_rol VALUES ('dadfcf47-e58d-4217-a4ad-45bf81c2b404', 'Contabilidad', 'abonos', 'ver', true, 'Acceder al módulo y ver listado', '2026-04-22 17:01:06.972783+00', '2026-05-14 20:15:36.353816+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f8c0c4c0-bbc8-45be-8e58-49435fa49cb4', 'Administrador de Obra', 'clientes', 'ver_historial', false, 'Ver línea de tiempo con eventos del cliente', '2026-04-23 00:38:33.52987+00', '2026-04-23 00:38:33.52987+00', NULL);
INSERT INTO public.permisos_rol VALUES ('eee0eaaf-6b7c-41ad-ac64-b6ac52dd4ef8', 'Gerencia', 'clientes', 'ver_historial', true, 'Ver línea de tiempo con eventos del cliente', '2026-04-23 00:38:33.52987+00', '2026-04-23 00:38:33.52987+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f61a421a-d8af-4806-9408-43a50fbfdcbc', 'Contabilidad', 'clientes', 'ver_historial', true, 'Ver línea de tiempo con eventos del cliente', '2026-04-23 00:38:33.52987+00', '2026-04-23 12:55:32.387768+00', NULL);
INSERT INTO public.permisos_rol VALUES ('cef7e0e1-ef7e-4940-8019-4f8a32d54633', 'Administrador', 'abonos', 'registrar', true, 'Registrar nuevos abonos de pago', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:42:18.034805+00', NULL);
INSERT INTO public.permisos_rol VALUES ('78b0067a-db9c-414b-b9b4-671f316aae4b', 'Administrador de Obra', 'abonos', 'registrar', true, 'Registrar nuevos abonos de pago', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:42:18.034805+00', NULL);
INSERT INTO public.permisos_rol VALUES ('4669176b-d3d2-4be6-9688-bf91dee99ecb', 'Gerencia', 'abonos', 'registrar', false, 'Registrar nuevos abonos de pago', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:42:18.034805+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f9d7f313-d02a-4785-b06e-14f4e85936ae', 'Administrador', 'abonos', 'anular', true, 'Anular abonos registrados', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:42:18.034805+00', NULL);
INSERT INTO public.permisos_rol VALUES ('511a35b0-90b8-45ee-ad35-dab3e76967ff', 'Administrador de Obra', 'abonos', 'anular', false, 'Anular abonos registrados', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:42:18.034805+00', NULL);
INSERT INTO public.permisos_rol VALUES ('72ef0423-62f0-4d17-97ff-f8a4e6cfa9ea', 'Gerencia', 'abonos', 'anular', false, 'Anular abonos registrados', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:42:18.034805+00', NULL);
INSERT INTO public.permisos_rol VALUES ('a26bf065-60a2-459b-9c46-18f1724b8907', 'Contabilidad', 'abonos', 'registrar', false, 'Registrar nuevos abonos de pago', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:52:36.29379+00', NULL);
INSERT INTO public.permisos_rol VALUES ('9de1d7b4-f34d-420f-adcc-79e8c4551e0a', 'Contabilidad', 'abonos', 'anular', false, 'Anular abonos registrados', '2026-04-23 17:42:14.905362+00', '2026-04-23 17:54:30.364766+00', NULL);
INSERT INTO public.permisos_rol VALUES ('072affbc-634b-4d5b-8984-d085d80e9dae', 'Administrador de Obra', 'negociaciones', 'trasladar', false, 'Permite trasladar la vivienda asignada a otra disponible', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('38bf48c3-bc20-4d7f-9c11-0e40c44f6080', 'Administrador de Obra', 'negociaciones', 'renunciar', false, 'Permite registrar la renuncia del cliente a la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f97a82fe-c26d-4733-a30b-7573ba6f3d1c', 'Administrador de Obra', 'negociaciones', 'descuento', false, 'Permite aplicar, modificar o quitar descuentos en la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('7a1cbb65-09de-4b85-a551-42f8fc3375c1', 'Administrador de Obra', 'negociaciones', 'escritura', false, 'Permite editar el valor de escritura pública de la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('0ec465cd-c735-4e3c-bdf2-9fdf3f42a0ac', 'Administrador de Obra', 'negociaciones', 'ajustar', false, 'Permite ajustar el cierre financiero (rebalanceo de fuentes de pago)', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('394a8c50-300e-4234-ae93-b6d84cd6399e', 'Gerencia', 'negociaciones', 'trasladar', false, 'Permite trasladar la vivienda asignada a otra disponible', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('91a2b48e-dba3-4d87-852f-9eaf5ddddf8a', 'Gerencia', 'negociaciones', 'renunciar', false, 'Permite registrar la renuncia del cliente a la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('d8a6a4a9-4066-429d-af3c-3d2312170b64', 'Gerencia', 'negociaciones', 'descuento', false, 'Permite aplicar, modificar o quitar descuentos en la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('ce47745f-723f-4e5f-999c-cdb1090b8be9', 'Gerencia', 'negociaciones', 'escritura', false, 'Permite editar el valor de escritura pública de la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('22fc95c3-fd73-4b66-8bd9-3d027579f6ac', 'Gerencia', 'negociaciones', 'ajustar', false, 'Permite ajustar el cierre financiero (rebalanceo de fuentes de pago)', '2026-04-23 13:25:49.679934+00', '2026-04-23 13:25:49.679934+00', NULL);
INSERT INTO public.permisos_rol VALUES ('77b1fded-867a-4d40-ade4-ab6b939062bf', 'Contabilidad', 'clientes', 'anotar_historial', true, 'Agregar notas manuales en el historial del cliente', '2026-04-23 18:27:53.427114+00', '2026-04-23 18:27:53.427114+00', NULL);
INSERT INTO public.permisos_rol VALUES ('05acad6e-307a-43fc-8267-03b00a33698f', 'Administrador de Obra', 'clientes', 'anotar_historial', true, 'Agregar notas manuales en el historial del cliente', '2026-04-23 18:27:53.427114+00', '2026-04-23 18:27:53.427114+00', NULL);
INSERT INTO public.permisos_rol VALUES ('1a923ce7-be88-4731-b4dd-f17897bd2741', 'Gerencia', 'clientes', 'anotar_historial', false, 'Agregar notas manuales en el historial del cliente', '2026-04-23 18:27:53.427114+00', '2026-04-23 18:27:53.427114+00', NULL);
INSERT INTO public.permisos_rol VALUES ('3e834dc3-6c37-450b-98a6-97b3a0abe9ca', 'Contabilidad', 'negociaciones', 'escritura', false, 'Permite editar el valor de escritura pública de la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 14:11:48.915708+00', NULL);
INSERT INTO public.permisos_rol VALUES ('47c74dce-0dfb-43ae-8a83-ed8ce2ccfefd', 'Contabilidad', 'negociaciones', 'renunciar', false, 'Permite registrar la renuncia del cliente a la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 14:12:20.699613+00', NULL);
INSERT INTO public.permisos_rol VALUES ('45dbb7ef-3fa3-4baa-84df-b8f11a9d6f03', 'Contabilidad', 'negociaciones', 'descuento', false, 'Permite aplicar, modificar o quitar descuentos en la negociación', '2026-04-23 13:25:49.679934+00', '2026-04-23 14:12:23.8246+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b56cf782-220f-4970-89fa-b2334a5362df', 'Contabilidad', 'negociaciones', 'trasladar', false, 'Permite trasladar la vivienda asignada a otra disponible', '2026-04-23 13:25:49.679934+00', '2026-04-23 16:06:56.480547+00', NULL);
INSERT INTO public.permisos_rol VALUES ('5c68c1c5-9812-40e2-b499-3d0f050f3fae', 'Contabilidad', 'negociaciones', 'ajustar', false, 'Permite ajustar el cierre financiero (rebalanceo de fuentes de pago)', '2026-04-23 13:25:49.679934+00', '2026-04-23 16:07:04.606113+00', NULL);
INSERT INTO public.permisos_rol VALUES ('01ebda5a-10ea-48f3-abf9-4215641ff661', 'Administrador de Obra', 'usuarios', 'eliminar', false, 'Desactivar usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('05c8c3dc-7313-4cfd-85a4-c119f752309d', 'Gerencia', 'usuarios', 'ver', true, 'Ver lista de usuarios y permisos', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('f7244e82-9f64-40c9-beaa-6bd4f8173207', 'Gerencia', 'usuarios', 'crear', true, 'Crear nuevos usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('c2aa8ff2-fcb1-485f-83f7-ed04a7d85da5', 'Gerencia', 'usuarios', 'editar', true, 'Modificar datos y rol de usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('1a6c7a44-ffc5-4415-b7aa-ebdd5a81445a', 'Gerencia', 'usuarios', 'eliminar', true, 'Desactivar usuarios', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('dff4c6da-e1cd-4d83-8e4c-4d4af85cdcdd', 'Contabilidad', 'auditorias', 'ver', true, 'Ver registros de auditoría', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('188f5fe8-e73f-4cef-a5b3-f187fb65d8c8', 'Administrador de Obra', 'auditorias', 'ver', false, 'Ver registros de auditoría', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('d782e953-a33f-4e49-bc91-6d242c38f2e4', 'Gerencia', 'auditorias', 'ver', true, 'Ver registros de auditoría', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('e324c7f7-7d31-4992-ad7f-f88ddc75cd67', 'Contabilidad', 'reportes', 'ver', true, 'Ver reportes y estadísticas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('2bbe47a6-3eda-4dd1-b6c2-469702846a4f', 'Administrador de Obra', 'reportes', 'ver', false, 'Ver reportes y estadísticas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('152a9b72-db2d-48d8-ad7e-b8896195d322', 'Gerencia', 'reportes', 'ver', true, 'Ver reportes y estadísticas', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('c21114e7-3424-485a-bf30-483ee9bf587c', 'Contabilidad', 'administracion', 'ver', false, 'Acceder al panel de administración', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('b64f3806-742c-428b-9a7e-d05328bfae4f', 'Administrador de Obra', 'administracion', 'ver', false, 'Acceder al panel de administración', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);
INSERT INTO public.permisos_rol VALUES ('dea1fd89-896b-4670-b143-e7c82d9d3885', 'Gerencia', 'administracion', 'ver', true, 'Acceder al panel de administración', '2026-04-22 17:01:06.972783+00', '2026-04-22 17:01:06.972783+00', NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict 9eLwBOidG3iCobHWsP1jAr7DaJNop6jIrJsWDK8zgFhkehDOSbuh1qiKXxrcV2z

