FROM gradle:jdk17

ARG DISCORD_TOKEN
ARG DATABASE_URL
ARG DATABASE_NAME

ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV DATABASE_NAME=${DATABASE_NAME}
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /usr/Penguin

COPY build.gradle build.gradle
COPY settings.gradle settings.gradle
COPY src src

RUN ["gradle", "build"]

CMD ["java", "-jar", "build/libs/Penguin-1.0.0-all.jar"]
