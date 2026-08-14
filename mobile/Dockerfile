FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ports Metro bundler / Expo dev server
EXPOSE 19000 19001 19002 8081

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# --tunnel est indispensable ici : depuis un conteneur Docker, un téléphone physique
# ou un simulateur sur le même réseau local ne peut pas atteindre le mode "LAN" par défaut.
CMD ["npx", "expo", "start", "--tunnel"]
