### 1. Instalar Jenkins

```bash
sudo apt-get update
sudo apt-get install -y fontconfig openjdk-17-jre
```

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```

```bash
sudo apt-get update
sudo apt-get install -y jenkins
```

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins
```

Libere a porta 8080 no firewall ou acesse via SSH tunnel. Para pegar a senha inicial:

sudo cat /var/lib/jenkins/secrets/initialAdminPassword
Acesse http://SEU_IP_JENKINS:8080, cole a senha, escolha “Install suggested plugins”, crie o usuário admin.

Plugins úteis: Pipeline, Git, Credentials Binding, ANSI Color, Docker Pipeline (opcional).

Dê permissão para o usuário jenkins usar Docker (na VM do Jenkins):

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 2. Criar um Node

Nome: Nome do seu Node
Diretório raiz remoto: /home/jenkins-agent
Rótulos: Label do servidor
Metodo de lançamento: Lauch agents via SSH
Host: IP ou Nome
Credentilas: Tipo(Username with password)
Host key verification Strategy: Non verifying verification Strategy

## 3. Se você está dentro de um Container Docker

Contêineres normalmente não têm systemd. Você deve iniciar o Jenkins diretamente pelo comando java ou criar um Dockerfile oficial.

Rodando manualmente:

```bash
java -jar /usr/share/java/jenkins.war --httpPort=8080
```

Usando a imagem oficial do Docker:

```bash
docker run -d -p 8080:8080 -p 50000:50000 --name jenkins jenkins/jenkins:lts
```

## 4. Conecte via SSH

```bash
ssh root@localhost -p 2221
```

## 5. Instalar o SSH dentro do container

Você pode acessar o container e instalar o OpenSSH:

```bash
docker exec -it ubuntu1 bash
apt update
apt install -y openssh-server
```

### 6. Configurar o SSH

Dentro do container, crie o diretório de runtime e defina uma senha para o root:

```bash
mkdir /var/run/sshd
echo "root:senha123" | chpasswd
```

> **Dica:** troque `senha123` por uma senha segura.

Habilite login do root (se necessário):

```bash
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
```

---

### 7. Alterar o `docker-compose.yml` para expor a porta

Cada container precisa de uma porta diferente no host:

```yaml
services:
  ubuntu1:
    image: ubuntu:22.04
    container_name: ubuntu1
    command: /usr/sbin/sshd -D
    ports:
      - "2221:22"
    networks:
      - minha-rede

  ubuntu2:
    image: ubuntu:22.04
    container_name: ubuntu2
    command: /usr/sbin/sshd -D
    ports:
      - "2222:22"
    networks:
      - minha-rede

  ubuntu3:
    image: ubuntu:22.04
    container_name: ubuntu3
    command: /usr/sbin/sshd -D
    ports:
      - "2223:22"
    networks:
      - minha-rede
```

> O comando `/usr/sbin/sshd -D` mantém o SSH rodando em foreground.

Depois rode:

```bash
docker compose up -d
```

---

## 8. Acessar via SSH

Agora você pode acessar cada container do host:

```bash
ssh root@localhost -p 2221   # para ubuntu1
ssh root@localhost -p 2222   # para ubuntu2
ssh root@localhost -p 2223   # para ubuntu3
```

Digite a senha que você definiu (`senha123`).

## 9. swapfile

# 1. Criar arquivo de 4GB (ideal para sua máquina)

sudo fallocate -l 4G /swapfile

# 2. Proteger permissões

sudo chmod 600 /swapfile

# 3. Formatá-lo como swap

sudo mkswap /swapfile

# 4. Ativar

sudo swapon /swapfile

# 5. Tornar permanente

echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# verifique

free -h
