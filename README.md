# Alphadate Backend

Backend serverless de Alphadate, desarrollado con TypeScript y AWS. Proporciona una API REST para gestionar fechas personalizadas por usuario y consultar fechas globales.

## Arquitectura

La infraestructura está definida mediante Terraform y utiliza servicios administrados de AWS.

```text
                    Client
                      |
                      v
                API Gateway
                      |
               Lambda Authorizer
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        Lambda      Lambda      Lambda
          |           |           |
          +-----------+-----------+
                      |
                      v
                   DynamoDB
```

### Servicios principales

- **AWS Lambda:** ejecución de la lógica de negocio.
- **Amazon API Gateway:** exposición de endpoints REST.
- **Amazon DynamoDB:** almacenamiento de usuarios y fechas.
- **Amazon Cognito:** autenticación mediante JWT.
- **AWS IAM:** gestión de permisos y roles.
- **Amazon S3:** almacenamiento del estado remoto de Terraform.
- **Terraform:** aprovisionamiento y administración de infraestructura.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js 22+ | Runtime |
| TypeScript | Lenguaje |
| AWS SDK v3 | Integración con AWS |
| Zod | Validación de datos |
| esbuild | Bundling de Lambdas |
| Terraform >= 1.5 | Infraestructura como código |
| DynamoDB | Base de datos |
| Python 3 | Scripts de carga de datos |

## Estructura del proyecto

```text
.
├── environments/
│   └── dev/
│       └── dev.tfbackend
│
├── modules/
│   ├── api_gateway_lambda_resource/
│   ├── dynamodb/
│   └── lambda/
│       └── bundle_lambda.sh
│
├── scripts/
│   └── populate_from_database/
│       ├── data.xlsx
│       ├── main.py
│       └── requirements.txt
│
├── src/
│   ├── application/
│   ├── domain/
│   ├── helpers/
│   ├── infraestructure/
│   ├── interfaces/
│   │   ├── lambdas/
│   │   └── lambdas_authorizer/
│   └── utils/
│
├── deployment.tf
├── endpoint_checkhealth.tf
├── endpoint_create_alphabet_date.tf
├── endpoint_get_alphabet_dates.tf
├── endpoint_get_global_alphabet_dates.tf
├── endpoint_remove_alphabet_date.tf
├── endpoint_update_alphabet_date.tf
├── main.tf
├── providers.tf
├── variables.tf
├── outputs.tf
├── Makefile
└── package.json
```

## API REST

La API está implementada mediante API Gateway REST y funciones Lambda independientes.

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| GET | `/health` | Verificar estado de la API | No |
| POST | `/alphabets/dates` | Crear una fecha personalizada | Sí |
| GET | `/alphabets/dates` | Obtener fechas del usuario | Sí |
| PUT | `/alphabets/dates/{dateId}` | Actualizar una fecha | Sí |
| DELETE | `/alphabets/dates/{dateId}` | Eliminar una fecha | Sí |
| GET | `/alphabets/recommendations` | Obtener fechas globales | No |

### Autenticación

La API utiliza un Lambda Authorizer de tipo REQUEST.

El flujo de autenticación es:

1. El cliente envía el token JWT mediante el encabezado `Authorization`.
2. El Authorizer verifica el token utilizando `aws-jwt-verify`.
3. Se obtiene el identificador Cognito (`sub`).
4. Se consulta DynamoDB mediante el índice `cognitoId-index`.
5. Se recupera el `uniqueId` del usuario.
6. API Gateway permite o deniega la solicitud.

Formato del encabezado:

```http
Authorization: Bearer <access_token>
```

## Modelo de datos

### Tabla de fechas

La tabla DynamoDB se genera con el siguiente nombre:

```text
alphadate-{environment}-alphabets
```

Claves principales:

| Atributo | Tipo | Descripción |
|---|---|---|
| userId | String | Identificador del usuario |
| dateId | String | Identificador único de la fecha |

Otros atributos:

| Atributo | Tipo |
|---|---|
| title | String |
| description | String |
| tags | String[] |
| status | String |
| creationDate | String |
| updatedAt | String |

Estados disponibles:

- `PUBLISHED`
- `DONE`

Las fechas globales utilizan el identificador:

```text
_GLOBAL_ALPHABET_DATES
```

## Configuración del entorno

Los valores predeterminados están definidos en `variables.tf`.

| Variable | Valor predeterminado |
|---|---|
| region | `us-east-1` |
| app_name | `alphadate` |
| environment | `dev` |
| global_alphabets_id | `_GLOBAL_ALPHABET_DATES` |

Las credenciales de AWS deben estar configuradas mediante los mecanismos habituales de AWS CLI o variables de entorno.

## Instalación

### Requisitos previos

- Node.js >= 22
- npm
- Terraform >= 1.5
- AWS CLI
- Credenciales AWS con permisos para administrar los recursos correspondientes.

### Instalar dependencias

```bash
npm install
```

### Inicializar Terraform

Para DEV:

```bash
make ENV=dev init
```

El backend remoto utiliza:

- Bucket: `alphadate-terraform-state`
- Región: `us-east-1`
- Locking: S3 native lockfile
- State key: `alphadate-backend-dev.tfstate`

La configuración del backend se encuentra en `environments/dev/dev.tfbackend`.

## Despliegue

El proyecto utiliza un Makefile para simplificar las operaciones de Terraform.

### DEV

```bash
make dev
```

### TST

```bash
make tst
```

### PRD

```bash
make prd
```

### Plan de infraestructura

```bash
make ENV=dev init
make ENV=dev plan
```

### Aplicar cambios

```bash
make ENV=dev apply
```

### Validar configuración

```bash
make validate
```

### Formatear archivos Terraform

```bash
make fmt
```

### Destruir infraestructura

```bash
make ENV=dev destroy
```

**Importante:** los entornos TST y PRD requieren sus respectivos archivos de configuración de backend en `environments/`.

## Construcción de AWS Lambda

Las funciones Lambda se generan automáticamente mediante esbuild durante el despliegue de Terraform.

El módulo `modules/lambda` utiliza `terraform_data` para detectar cambios en los archivos TypeScript y en `package.json`.

El proceso genera:

```text
src/interfaces/lambdas/{LambdaName}/dist/app.js
```

Características del bundle:

- Runtime Node.js 22.
- Formato CommonJS.
- Minificación.
- Source maps.
- Empaquetado ZIP para AWS Lambda.

## Carga de fechas globales

El proyecto incluye un script Python para importar fechas desde Excel hacia DynamoDB.

Ubicación:

```text
scripts/populate_from_database/
```

### Instalar dependencias

```bash
cd scripts/populate_from_database
pip install -r requirements.txt
```

### Ejecutar importación

```bash
python main.py
```

El archivo `data.xlsx` debe contener las siguientes columnas:

- `Letras`
- `Nivel`
- `Lugar`
- `Descripcion`

El script genera identificadores UUID, asigna el estado `PUBLISHED` y utiliza la zona horaria `America/Lima`.

La tabla y región están configuradas actualmente en el propio script.

**Precaución:** la importación utiliza `put_item` con identificadores UUID nuevos, por lo que ejecutar el script nuevamente puede generar registros duplicados.

## Manejo de fechas

El proyecto centraliza la gestión temporal en `DateService`.

Características:

- Zona horaria predeterminada: `America/Lima`.
- Serialización ISO 8601.
- Validación de fechas con offset horario.
- Formateo consistente de fechas.
- Abstracción `Clock` para facilitar pruebas y control temporal.

La zona horaria puede modificarse mediante la variable de entorno `TIMEZONE`.

## Seguridad

- Autenticación mediante AWS Cognito y JWT.
- Autorización centralizada mediante Lambda Authorizer.
- Permisos IAM específicos para las funciones Lambda.
- Validación de entradas con Zod.
- Separación de datos por identificador de usuario.
- Credenciales AWS gestionadas fuera del repositorio.

No se deben versionar credenciales, archivos de estado Terraform ni variables sensibles.

## Licencia

Este proyecto está distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para conocer sus condiciones.
