# Mini Nest

## Goal
Implement a minimal Nest-like framework

The request pipeline order is demonstrated as:

DI → Pipes → Guards → Interceptors → Filters

## Implemented Features
### IoC/DI
- `@Injectable()` marks classes as resolvable by the container
- `@Inject(token)` allows explicit injection token for a constructor parameter
- `Container.resolve(token)`:
  - creates or returns a cached instance (singleton scope by default)
  - resolves transitive dependencies

### Modules
- `@Module({ providers, controllers, imports })`
- `NestFactory.create(AppModule)` recursively initializes the module graph

### HTTP Layer
- `@Controller(prefix)` registers controller routes
- `@Get/@Post/@Put/@Patch/@Delete` register HTTP handlers based on metadata

### Parameters
- `@Param(name)`, `@Query(name)`, `@Body()` extract values from request

### Pipes
Global pipes → Controller pipes → Method pipes → Param pipes

### Guards
- `@UseGuards(ApiKeyGuard)` can stop handler execution 
- returns 403 if not allowed

### Interceptors
- `@UseInterceptors(ResponseTimeInterceptor)`

### Filters
- `HttpException(status, message, details)` 
- Global exception filter maps exceptions to an HTTP response

## Demo Endpoint
`GET /users/:id` with `ParseUUIDPipe`

## Run

```bash
npm install
npm run dev
```

## Demo Requests
**400 invalid UUID**
```
curl -i http://localhost:3000/users/not-a-uuid
```

**200**
```
curl -i -H "x-api-key: secret" http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440001
```

<img width="1381" height="347" alt="image" src="https://github.com/user-attachments/assets/dfdb411e-77bf-4b14-966d-6786d4ed0492" />
