import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

const chai = use(chaiHttp);
const request = chai.request.execute;

export { chai, expect, request, sinon };
