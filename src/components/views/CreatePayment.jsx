import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Col, Form, notification, PageHeader, Row } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import useCampaign from '../../hooks/useCampaign';
// import { Context as ConversionRateContext } from '../../contextProviders/ConversionRateProvider';
import { Context as WhiteListContext } from '../../contextProviders/WhiteListProvider';
import Web3ConnectWarning from '../Web3ConnectWarning';
import {
  MilestoneCampaignInfo,
  MilestoneDatePicker,
  MilestoneDescription,
  MilestoneDonateToDac,
  MilestoneFiatAmountCurrency,
  MilestonePicture,
  MilestoneRecipientAddress,
  MilestoneTitle,
  MilestoneToken,
} from '../EditMilestoneCommons';
import { Context as UserContext } from '../../contextProviders/UserProvider';
import { convertEthHelper, getStartOfDayUTC, history, ZERO_ADDRESS } from '../../lib/helpers';
import ErrorHandler from '../../lib/ErrorHandler';
import { Context as ConversionRateContext } from '../../contextProviders/ConversionRateProvider';
import { authenticateUser } from '../../lib/middleware';
import BridgedMilestone from '../../models/BridgedMilestone';
import config from '../../configuration';
import { Milestone } from '../../models';
import { MilestoneService } from '../../services';
import { Context as Web3Context } from '../../contextProviders/Web3Provider';

const WAIT_INTERVAL = 1000;

function CreatePayment(props) {
  const {
    state: { fiatWhitelist },
  } = useContext(WhiteListContext);

  const {
    state: { currentUser },
  } = useContext(UserContext);

  const {
    actions: { getConversionRates },
  } = useContext(ConversionRateContext);

  const {
    state: { isForeignNetwork },
    actions: { displayForeignNetRequiredWarning },
  } = useContext(Web3Context);

  const [form] = Form.useForm();

  const { id: campaignId, slug: campaignSlug } = props.match.params;
  const campaign = useCampaign(campaignId, campaignSlug);

  const [payment, setPayment] = useState({
    title: '',
    fiatAmount: 0,
    currency: '',
    token: {},
    date: getStartOfDayUTC().subtract(1, 'd'),
    description: '',
    picture: '',
    donateToDac: true,
    recipientAddress: '',
    notCapped: false,
    conversionRateTimestamp: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [userIsCampaignOwner, setUserIsOwner] = useState(false);
  const [maxAmount, setMaxAmount] = useState(new BigNumber(0));
  const [loadingRate, setLoadingRate] = useState(false);
  const [loadingAmount, setLoadingAmount] = useState(false);

  const timer = useRef();
  const isMounted = useRef(true);
  const conversionRateTimestamp = useRef();
  const [submitButtonText, setSubmitButtonText] = useState('Propose');

  useEffect(() => {
    if (loadingAmount) {
      setSubmitButtonText('Loading Amount');
    } else {
      setSubmitButtonText(userIsCampaignOwner ? 'Create' : 'Propose');
    }
  }, [loadingAmount, userIsCampaignOwner]);

  useEffect(() => {
    setUserIsOwner(
      campaign &&
        currentUser.address &&
        [campaign.ownerAddress, campaign.coownerAddress].includes(currentUser.address),
    );
  }, [campaign, currentUser]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (currentUser.address && !payment.recipientAddress) {
      setPayment({
        ...payment,
        recipientAddress: currentUser.address,
      });
      form.setFieldsValue({ recipientAddress: currentUser.address });
    }
  }, [currentUser]);

  // Update item of this item in milestone token
  const updateAmount = () => {
    const { token, currency, date, fiatAmount, notCapped } = payment;
    if (!token.symbol || !currency || notCapped) return;

    setLoadingAmount(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(async () => {
      try {
        setLoadingRate(true);
        const res = await getConversionRates(date, token.symbol, currency);
        const rate = res.rates[currency];
        if (rate && isMounted.current) {
          conversionRateTimestamp.current = res.timestamp;
          setMaxAmount(new BigNumber(fiatAmount).div(rate));
        } else {
          throw new Error('Rate not found');
        }
      } catch (e) {
        const message = `Sadly we were unable to get the exchange rate. Please try again after refresh.`;

        ErrorHandler(e, message);
        setMaxAmount(0);
      } finally {
        setLoadingRate(false);
        setLoadingAmount(false);
      }
    }, WAIT_INTERVAL);
  };

  useEffect(() => {
    updateAmount();
  }, [payment.token, payment.fiatAmount, payment.date, payment.currency]);

  const handleInputChange = event => {
    const { name, value, type, checked } = event.target;
    if (type === 'checkbox') {
      setPayment({ ...payment, [name]: checked });
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const handleSelectCurrency = (_, option) => {
    handleInputChange({ target: { name: 'currency', value: option.value } });
  };

  const handleSelectToken = token => {
    handleInputChange({
      target: { name: 'token', value: token },
    });
  };

  const handleDatePicker = dateString => {
    handleInputChange({ target: { name: 'date', value: dateString } });
  };

  const setPicture = address => {
    handleInputChange({ target: { name: 'picture', value: address } });
  };

  const goBack = () => {
    props.history.goBack();
  };

  const submit = async () => {
    const authenticated = await authenticateUser(currentUser, false);

    if (authenticated) {
      if (userIsCampaignOwner && !isForeignNetwork) {
        displayForeignNetRequiredWarning();
        return;
      }

      const {
        title,
        description,
        picture,
        recipientAddress,
        notCapped,
        fiatAmount,
        currency,
        token,
        date,
        donateToDac,
      } = payment;

      const ms = new BridgedMilestone({
        title,
        description,
        recipientAddress,
        token,
        image: picture,
        reviewerAddress: ZERO_ADDRESS,
      });

      ms.ownerAddress = currentUser.address;
      ms.campaignId = campaign._id;
      ms.parentProjectId = campaign.projectId;

      if (donateToDac) {
        ms.dacId = config.defaultDacId;
      }

      if (!notCapped) {
        ms.maxAmount = maxAmount;
        ms.date = date;
        ms.fiatAmount = new BigNumber(fiatAmount);
        ms.selectedFiatType = currency;
        ms.conversionRateTimestamp = conversionRateTimestamp.current;
      }

      if (!userIsCampaignOwner) {
        ms.status = Milestone.PROPOSED;
      }

      setLoading(true);

      await MilestoneService.save({
        milestone: ms,
        from: currentUser.address,
        afterSave: (created, txUrl, res) => {
          let notificationDescription;
          if (created) {
            if (!userIsCampaignOwner) {
              notificationDescription = 'Payment proposed to the Campaign Owner';
            }
          } else if (txUrl) {
            notificationDescription = (
              <p>
                Your Payment is pending....
                <br />
                <a href={txUrl} target="_blank" rel="noopener noreferrer">
                  View transaction
                </a>
              </p>
            );
          } else {
            notificationDescription = 'Your Payment has been updated!';
          }

          if (description) {
            notification.info({ description: notificationDescription });
          }
          setLoading(false);
          history.push(`/campaigns/${campaign._id}/milestones/${res._id}`);
        },
        afterMined: (created, txUrl) => {
          notification.success({
            description: (
              <p>
                Your Payment has been created!
                <br />
                <a href={txUrl} target="_blank" rel="noopener noreferrer">
                  View transaction
                </a>
              </p>
            ),
          });
        },
        onError(message, err) {
          setLoading(false);
          return ErrorHandler(err, message);
        },
      });
    }
  };

  return (
    <Fragment>
      <Web3ConnectWarning />
      <div id="create-payment-view">
        <Row>
          <Col span={24}>
            <PageHeader
              className="site-page-header"
              onBack={goBack}
              title="Create New Payment"
              ghost={false}
            />
          </Col>
        </Row>
        <Row>
          <div className="card-form-container">
            <Form
              className="card-form"
              requiredMark
              initialValues={{
                currency: fiatWhitelist[0] || 'USD',
              }}
              onFinish={submit}
              form={form}
              scrollToFirstError={{
                block: 'center',
                behavior: 'smooth',
              }}
            >
              <div className="card-form-header">
                <img src={`${process.env.PUBLIC_URL}/img/payment.png`} alt="payment-logo" />
                <div className="title">Payment</div>
              </div>

              <MilestoneCampaignInfo campaign={campaign} />

              <MilestoneTitle
                value={payment.title}
                onChange={handleInputChange}
                extra="What are you going to accomplish in this Milestone?"
              />

              <div className="section">
                <div className="title">Payment details</div>

                <Row>
                  <Form.Item className="custom-form-item">
                    <Checkbox
                      name="notCapped"
                      checked={payment.notCapped}
                      onChange={handleInputChange}
                    >
                      No limits
                    </Checkbox>
                  </Form.Item>
                </Row>

                {!payment.notCapped && (
                  <Fragment>
                    <MilestoneFiatAmountCurrency
                      onCurrencyChange={handleSelectCurrency}
                      onAmountChange={handleInputChange}
                      amount={payment.fiatAmount}
                      currency={payment.currency}
                      disabled={loadingRate}
                    />
                    <MilestoneDatePicker
                      onChange={handleDatePicker}
                      value={payment.date}
                      disabled={loadingRate}
                    />
                  </Fragment>
                )}

                <MilestoneDescription
                  onChange={handleInputChange}
                  value={payment.description}
                  extra="Describe how you are going to execute this milestone successfully..."
                  placeholder="e.g. Monthly salary"
                  id="description"
                />

                <MilestonePicture
                  setPicture={setPicture}
                  milestoneTitle={payment.title}
                  picture={payment.picture}
                />

                <MilestoneDonateToDac value={payment.donateToDac} onChange={handleInputChange} />
              </div>

              <div className="section">
                <div className="title">Payment options</div>
                <MilestoneToken
                  label="Payment currency"
                  onChange={handleSelectToken}
                  includeAnyToken={payment.notCapped}
                  totalAmount={convertEthHelper(maxAmount, payment.token.decimals)}
                  hideTotalAmount={payment.notCapped}
                  value={payment.token}
                />

                <MilestoneRecipientAddress
                  label="Pay to wallet address"
                  onChange={handleInputChange}
                  value={payment.recipientAddress}
                />
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading || loadingAmount}>
                  {submitButtonText}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Row>
      </div>
    </Fragment>
  );
}

CreatePayment.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      slug: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default CreatePayment;
