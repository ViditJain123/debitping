// filepath: /Users/viditjain/Desktop/whatsapp_automation/src/app/dashboard/settings/twilio-test/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Alert,
  AlertDescription,
  AlertTitle 
} from '@/components/ui/alert';
import { Check, AlertTriangle, X } from 'lucide-react';
import DashboardLayout from '../../../../components/DashboardLayout';

export default function TwilioTestPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [accountError, setAccountError] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Check Twilio account status when the component mounts
  useEffect(() => {
    async function checkTwilioAccount() {
      try {
        setCheckingAccount(true);
        const response = await fetch('/api/twilio/status');
        
        if (!response.ok) {
          throw new Error('Could not retrieve account information');
        }
        
        const data = await response.json();
        setAccountInfo(data);
      } catch (err) {
        setAccountError(err.message || 'Failed to check Twilio account status');
      } finally {
        setCheckingAccount(false);
      }
    }
    
    checkTwilioAccount();
  }, []);

  // Function to debug Twilio credentials
  const handleDebugCredentials = async () => {
    try {
      setDebugLoading(true);
      const response = await fetch('/api/twilio/debug');
      
      if (!response.ok) {
        throw new Error('Failed to debug Twilio credentials');
      }
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err.message || 'Failed to debug Twilio credentials');
    } finally {
      setDebugLoading(false);
    }
  };

  const handleTest = async (sendMessage = false) => {
    if (!phoneNumber) {
      setError('Please enter a phone number to test');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/test-phone-format?phone=${encodeURIComponent(phoneNumber)}&send=${sendMessage}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to test phone number');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error testing phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Twilio WhatsApp Integration Test">
      <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm p-5 border border-gray-100/50 dark:border-gray-700/50">
        {/* Twilio Account Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Twilio Account Status</CardTitle>
            <CardDescription>
              Your Twilio account configuration information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkingAccount ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : accountError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {accountError}
                </AlertDescription>
              </Alert>
            ) : accountInfo ? (
              <>
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDebugCredentials}
                    disabled={debugLoading}
                    className="text-xs"
                  >
                    {debugLoading ? 'Checking...' : 'Debug Connection'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Configuration Status:</h3>
                      <div className="flex items-center">
                        {accountInfo.configured ? (
                          <span className="text-green-500 flex items-center">
                            <Check className="h-4 w-4 mr-1" /> Configured
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center">
                            <X className="h-4 w-4 mr-1" /> Not configured
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Environment:</h3>
                      <p className="capitalize">{accountInfo.environment}</p>
                    </div>
                    {accountInfo.twilioAccountSid && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Account SID:</h3>
                        <p>{accountInfo.twilioAccountSid}</p>
                      </div>
                    )}
                    {accountInfo.fromNumberDisplay && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">WhatsApp From Number:</h3>
                        <p>{accountInfo.fromNumberDisplay}</p>
                      </div>
                    )}
                    {accountInfo.accountStatus && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Status:</h3>
                        <p className={`capitalize ${accountInfo.accountStatus === 'active' ? 'text-green-500' : 'text-amber-500'}`}>
                          {accountInfo.accountStatus}
                        </p>
                      </div>
                    )}
                    {accountInfo.accountType && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Type:</h3>
                        <p className="capitalize">{accountInfo.accountType}</p>
                      </div>
                    )}
                  </div>
                  
                  {accountInfo.warning && (
                    <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        {accountInfo.warning}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!accountInfo.configured && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Missing Configuration</AlertTitle>
                      <AlertDescription>
                        The Twilio integration is not properly configured. Please ensure you have set the following environment variables:
                        <ul className="list-disc list-inside mt-2">
                          <li>TWILIO_ACCOUNT_SID</li>
                          <li>TWILIO_AUTH_TOKEN</li>
                          <li>TWILIO_WHATSAPP_NUMBER (with whatsapp: prefix)</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Debug Information */}
                  {debugInfo && (
                    <div className="mt-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                      <h3 className="text-sm font-medium mb-2">Connection Diagnostics</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Account SID:</span>
                          <p>{debugInfo.credentialsStatus.accountSid}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Auth Token:</span>
                          <p>{debugInfo.credentialsStatus.authTokenSet ? 'Present' : 'Missing'}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Authentication:</span>
                          <p className={debugInfo.credentialsStatus.authSuccess ? 'text-green-500' : 'text-red-500'}>
                            {debugInfo.credentialsStatus.authSuccess ? 'Success' : 'Failed'}
                          </p>
                        </div>
                        
                        {debugInfo.credentialsStatus.errorMessage && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Error:</span>
                            <p className="text-red-500">{debugInfo.credentialsStatus.errorMessage}</p>
                          </div>
                        )}
                        
                        {debugInfo.credentialsStatus.warning && (
                          <div className="col-span-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                            <p className="text-yellow-700 dark:text-yellow-400">{debugInfo.credentialsStatus.warning}</p>
                            <p className="mt-1">Correct format: <code>{debugInfo.credentialsStatus.correctFromNumber}</code></p>
                          </div>
                        )}
                        
                        {debugInfo.credentialsStatus.authSuccess && (
                          <div className="col-span-2 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            <p className="text-green-700 dark:text-green-400">
                              Your Twilio credentials are working correctly!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p>No account information available</p>
            )}
          </CardContent>
        </Card>
        
        {/* Test Phone Number Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Your Twilio Integration</CardTitle>
            <CardDescription>
              Use this page to verify your Twilio configuration and test sending WhatsApp messages. Enter a phone number in E.164 format (with country code) to validate it and optionally send a test message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone Number</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    id="phone"
                    placeholder="Enter phone number (e.g. +1234567890)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleTest(false)}
                      disabled={loading}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {loading && !result ? (
                        <span className="flex items-center">
                          <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                          Validating...
                        </span>
                      ) : 'Validate Number'}
                    </Button>
                    <Button 
                      onClick={() => handleTest(true)}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      {loading && result ? (
                        <span className="flex items-center">
                          <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                          Sending...
                        </span>
                      ) : 'Send Test Message'}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a phone number in E.164 format (with country code)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Phone Number:</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Original:</p>
                      <p>{result.original}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Formatted for WhatsApp:</p>
                      <p>{result.formatted}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold flex items-center">
                    Validation: 
                    {result.isValid ? (
                      <span className="ml-2 text-green-500 flex items-center">
                        <Check className="h-4 w-4 mr-1" /> Valid
                      </span>
                    ) : (
                      <span className="ml-2 text-red-500 flex items-center">
                        <X className="h-4 w-4 mr-1" /> Invalid
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.isValid 
                      ? 'This phone number appears to be valid for WhatsApp messaging.' 
                      : 'This phone number does not appear to be in a valid format for WhatsApp messaging.'}
                  </p>
                </div>
                
                {result.messageSent !== null && (
                  <div>
                    <h3 className="font-semibold flex items-center">
                      Message Delivery: 
                      {result.messageSent ? (
                        <span className="ml-2 text-green-500 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Sent
                        </span>
                      ) : (
                        <span className="ml-2 text-red-500 flex items-center">
                          <X className="h-4 w-4 mr-1" /> Failed
                        </span>
                      )}
                    </h3>
                    
                    {result.messageSent && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Message ID:</p>
                        <p className="font-mono text-sm">{result.messageId}</p>
                        <p className="text-sm text-muted-foreground mt-2">Status:</p>
                        <p className="capitalize">{result.messageStatus || 'Sent'}</p>
                      </div>
                    )}
                    
                    {!result.messageSent && result.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Delivery Error</AlertTitle>
                        <AlertDescription>
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {result.messageSent 
                  ? 'Your test message has been sent. It may take a few moments to be delivered.' 
                  : 'No test message was sent. Use the "Send Test Message" button to send a test.'}
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
