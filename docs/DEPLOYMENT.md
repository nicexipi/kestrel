# Guia de Deployment

## 🚀 Ambientes

### Desenvolvimento
- Local
- Containers Docker
- Base de dados local

### Staging
- AWS ECS
- Dados sanitizados
- Testes de integração

### Produção
- AWS ECS
- Alta disponibilidade
- Monitoramento completo

## 📋 Pré-requisitos

### Infraestrutura AWS
- VPC configurada
- Subnets (público/privado)
- NAT Gateway
- Security Groups

### Serviços Necessários
- ECS Cluster
- RDS (PostgreSQL)
- ElastiCache (Redis)
- CloudFront
- Route 53
- ACM (certificados)

## 🔧 Configuração

### 1. Base de Dados
```bash
# Criar base de dados RDS
aws rds create-db-instance \
    --db-instance-identifier kestrel-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username kestrel \
    --master-user-password <password> \
    --allocated-storage 20

# Aplicar migrations
DATABASE_URL=postgresql://user:pass@host:5432/kestrel npx prisma migrate deploy
```

### 2. Containers

```dockerfile
# Build das imagens
docker build -t kestrel-server -f Dockerfile.server .
docker build -t kestrel-client -f Dockerfile.client .

# Push para ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.eu-west-1.amazonaws.com
docker tag kestrel-server:latest $AWS_ACCOUNT.dkr.ecr.eu-west-1.amazonaws.com/kestrel-server:latest
docker tag kestrel-client:latest $AWS_ACCOUNT.dkr.ecr.eu-west-1.amazonaws.com/kestrel-client:latest
docker push $AWS_ACCOUNT.dkr.ecr.eu-west-1.amazonaws.com/kestrel-server:latest
docker push $AWS_ACCOUNT.dkr.ecr.eu-west-1.amazonaws.com/kestrel-client:latest
```

### 3. ECS Services

```bash
# Criar task definitions
aws ecs register-task-definition --cli-input-json file://task-definition-server.json
aws ecs register-task-definition --cli-input-json file://task-definition-client.json

# Criar serviços
aws ecs create-service \
    --cluster kestrel \
    --service-name kestrel-server \
    --task-definition kestrel-server \
    --desired-count 2 \
    --launch-type FARGATE

aws ecs create-service \
    --cluster kestrel \
    --service-name kestrel-client \
    --task-definition kestrel-client \
    --desired-count 2 \
    --launch-type FARGATE
```

## 🔐 Variáveis de Ambiente

### Produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@rds-host:5432/kestrel
REDIS_URL=redis://elasticache-host:6379
JWT_SECRET=<secret>
BGG_API_BASE_URL=https://boardgamegeek.com/xmlapi2
AWS_REGION=eu-west-1
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@rds-staging:5432/kestrel_staging
REDIS_URL=redis://elasticache-staging:6379
JWT_SECRET=<staging-secret>
BGG_API_BASE_URL=https://boardgamegeek.com/xmlapi2
AWS_REGION=eu-west-1
```

## 📊 Monitoramento

### CloudWatch

1. **Métricas**
   - CPU/Memória
   - Requests/s
   - Latência
   - Erros 4xx/5xx

2. **Logs**
   - Application logs
   - Access logs
   - Error logs

3. **Alarmes**
   - High CPU
   - Error rate
   - Response time
   - Disk usage

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy to Production
on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v1
      - name: Build and push
        run: |
          docker build ...
          docker push ...
      - name: Deploy ECS
        run: |
          aws ecs update-service ...
```

## 🔄 Rollback

### Procedimento
1. Identificar versão estável
2. Atualizar task definition
3. Update ECS service
4. Verificar health checks
5. Confirmar rollback

### Comando
```bash
# Rollback para versão anterior
aws ecs update-service \
    --cluster kestrel \
    --service kestrel-server \
    --task-definition kestrel-server:PREVIOUS_VERSION \
    --force-new-deployment
```

## 📦 Backup

### RDS
```bash
# Snapshot manual
aws rds create-db-snapshot \
    --db-instance-identifier kestrel-db \
    --db-snapshot-identifier kestrel-backup-$(date +%Y%m%d)
```

### S3
```bash
# Backup de assets
aws s3 sync s3://kestrel-assets s3://kestrel-backup/assets-$(date +%Y%m%d)
```

## 🔍 Troubleshooting

### Logs
```bash
# Ver logs do serviço
aws logs get-log-events \
    --log-group-name /ecs/kestrel-server \
    --log-stream-name APP/kestrel-server/TASK_ID

# Ver logs do container
docker logs CONTAINER_ID
```

### Métricas
```bash
# CPU/Memory
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value=kestrel-server \
    --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Average
```

## 📝 Checklist de Deploy

- [ ] Testes passando
- [ ] Migrations testadas
- [ ] Variáveis de ambiente configuradas
- [ ] Certificados SSL válidos
- [ ] Backups recentes
- [ ] Monitoramento ativo
- [ ] Documentação atualizada
- [ ] Equipe notificada
