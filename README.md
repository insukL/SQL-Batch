# SQL 결과 자동 생성 프로그램

## 개요

실무에서 사용되는 유효한 데이터를 추출하기 위해 저장한 쿼리문을 Daily로 실행시키는 프로그램

<br/>

## 문서 이동

[프로그램 구조](#프로그램-구조)

[API](#api)

- [URI](#uri)
- [작동 방법 및 파일 설명](#작동-방법-및-파일-설명)
- [Log 파일](#log-파일)

<br/>

## 프로그램 구조

```
├─src
│  ├─config
│  ├─controller
│  ├─database
│  ├─middleware
│  ├─service
│  ├─type
│  └─utils
```

- src/config
  - DB 설정 및 환경에 따른 어플리케이션 설정 파일
- src/controller
  - API 컨트롤러 구성 클래스
- src/database
  - 데이터베이스 설정 및 커넥션 설정 클래스
  - 쿼리 결과 반환 클래스
- src/middleware
  - 사용자 IP 미들웨어
  - 에러 핸들링 미들 웨어
  - ip 체크 미들 웨어
- src/service
  - 백업 서비스 로직
  - 쿼리 실행 서비스 로직
- src/util
  - 로직 내에서 사용되는 관련 클래스

## API

### URI

- POST /query
  - Param : type
  - 쿼리 스트링으로 전달한 type과 동일한 type을 가지는 config가 가리키는 SQL 파일을 실행하여 CSV 파일로 저장합니다.

### 작동 방법 및 파일 설명

1. 마운팅된 폴더의 config 폴더(dev에서는 프로그램 구동시 루트 디렉토리에 자동 생성)에 아래 양식에 맞는 json 파일을 생성한다.
   - Airflow는 API Param이 batch로 설정되어 있으므로 Daily로 실행할 파일은 type을 batch로 설정한다.

```
{
  "db": {
    "database": "사용할 DB명"
  },
  "file": {
    "sql": "사용할 SQL파일의 확장자(.sql)를 포함한 이름",
    "result": "결과물의 확장자(.csv)를 포함한 이름",
    "type": "사용할 type (postman에 입력한 type과 동일한 쿼리만 실행)"
  }
}

ex)
{
  "db": {
    "database": "db-name"
  },
  "file": {
    "sql": "test1.sql",
    "result": "test2.csv",
    "type": "once"
  }
}

```

2. 마운팅된 폴더의 sql 폴더(dev에서는 프로그램 구동시 루트 디렉토리에 자동 생성)에 작동할 sql 파일을 생성한다.

3. Postman에서 API를 요청한다.

4. 결과가 마운팅된 폴더의 result 폴더(dev는 루트 디렉토리의 csv 디렉토리)가 생성된다.

5. API 실행 시 이미 결과 파일이 폴더에 존재할 경우 backup 폴더에 옮겨진다.

   - backup/{config type}/{YYYY_MM_DD}/{저장한 시각}으로 폴더가 옮겨진다.
   - API 실행 시 요청한 타입과 동일 타입 결과 중 일주일 이상 지난 폴더는 삭제된다.

### Log 파일

API 실행에 대한 정보는 마운팅된 폴더의 logs 폴더에 저장된다.

1.  access
    - API를 실행한 일시, 접근한 IP, URI 정보에 대해 저장한다.

```
실행 일시 | 접근 IP | URI 정보

ex) 2022-12-29 12:03:51|127.0.0.1|/query?type=batch
```

2. customError
   - 어플리케이션 내에서 발생한 Custom Error에 대해 저장한다.
   - 대표적으로 금지어가 발생한 에러가 있다.

```
{"level":로깅 레벨, "message": {세부사항 , 에러 코드, 에러 메시지, [발생 sql]}, "timestamp": 발생 시각}
```

3. unknownError
   - 어플리케이션 내에서 발생한 Custom Error가 아닌 에러에 대한 정보를 저장한다.
   - 대표적으로 SQL 구문 오류, 폴더 확인 불가 등이 있다.

```
{"level":로깅 레벨, "message": {에러 정보, [발생 sql]}, "timestamp": 발생 시각}
```

4. result
   - 실행한 API에 대해서 성공 및 실패에 대한 정보를 저장한다.

```
{"level":로깅 레벨, "message": {failure: 실패한 횟수, success: 성공한 횟수}, "timestamp": 발생 시각}

ex) {"level":"info","message":{"failure":0,"success":0},"timestamp":"2022-12-15 16:06:39"}
```
