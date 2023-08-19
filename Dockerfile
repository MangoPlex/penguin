FROM gradle:jdk17 as build

COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon

FROM eclipse-temurin:17-jre-jammy

ARG DISCORD_TOKEN
ARG DATABASE_URL
ARG DATABASE_NAME

ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV DATABASE_NAME=${DATABASE_NAME}
ENV DATABASE_URL=${DATABASE_URL}

RUN mkdir /app

COPY --from=build /home/gradle/src/build/libs/Penguin-1.0.0.jar /app/Penguin-1.0.0.jar

CMD java -XX:+UnlockExperimentalVMOptions -jar /app/Penguin-1.0.0.jar
